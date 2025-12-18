import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS } from "@/lib/compare-config";
import {
  createCompareAnalysisPrompt,
  TOKEN_LIMITS,
} from "@/lib/providers/ai-helpers";
import OpenAI from "openai";
import { DatabaseResponseData, ProviderResponse } from "@/lib/types";

const PROVIDER_COLUMN: Record<string, keyof DatabaseResponseData> = {
  openai: "openai_response",
  anthropic: "anthropic_response",
  gemini: "gemini_response",
  grok: "grok_response",
  perplexity: "perplexity_response",
  deepseek: "deepseek_response",
};

// ✅ Helper: Get base URL
function getBaseUrl(): string {
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "";
}

// ✅ Helper: Call a single provider
async function callProvider(
  model: (typeof COMPARE_MODELS)[number],
  message: string,
  requestHeaders: Headers
): Promise<ProviderResponse> {
  try {
    const baseUrl = getBaseUrl();
    const apiUrl = `${baseUrl}/api/providers/${model.provider}`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: requestHeaders.get("Cookie") || "",
      },
      body: JSON.stringify({
        message,
        model: model.id,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[CompareChat] ${model.provider} error:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `${model.provider} API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    return {
      model: model.name,
      modelId: model.id,
      provider: model.provider,
      response: data.response || "No response",
      success: true,
    };
  } catch (error) {
    console.error(`[CompareChat] Error with ${model.name}:`, error);
    return {
      model: model.name,
      modelId: model.id,
      provider: model.provider,
      response: `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      success: false,
    };
  }
}

async function generateSummary(
  message: string,
  results: ProviderResponse[]
): Promise<string> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const summaryPrompt = createCompareAnalysisPrompt(message, results);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: summaryPrompt }],
      max_tokens: TOKEN_LIMITS.GENERAL,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("[CompareChat] Error generating summary:", error);
    return "";
  }
}

function prepareResponseData(
  userId: string,
  chatId: string | null,
  message: string,
  results: ProviderResponse[],
  summary: string
): DatabaseResponseData {
  const responseData: DatabaseResponseData = {
    user_id: userId,
    chat_id: chatId,
    user_question: message,
    summary: summary || null,
  };

  results.forEach((result) => {
    const columnName = PROVIDER_COLUMN[result.provider];
    if (columnName) {
      responseData[columnName] = result.response;
    } else {
      console.warn(`[CompareChat] Unknown provider: ${result.provider}`);
    }
  });

  return responseData;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chat_id } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const responses = await Promise.allSettled(
      COMPARE_MODELS.map((model) =>
        callProvider(model, message, request.headers)
      )
    );

    const results: ProviderResponse[] = responses.map((result, index) => {
      const model = COMPARE_MODELS[index];
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          model: model.name,
          modelId: model.id,
          provider: model.provider,
          response: `Failed to get response: ${result.reason}`,
          success: false,
        };
      }
    });

    // Generate summary
    const summary = await generateSummary(message, results);

    // Prepare and save response data
    const responseData = prepareResponseData(
      user.id,
      chat_id,
      message,
      results,
      summary
    );

    const { data: sessionData, error: sessionError } = await supabase
      .from("compare_sessions")
      .insert(responseData)
      .select("id")
      .single();

    if (sessionError) {
      console.error("[CompareChat] Error saving session:", sessionError);
      throw new Error(`Failed to save session: ${sessionError.message}`);
    }

    return NextResponse.json({
      success: true,
      responses: results,
      summary,
      session_id: sessionData.id,
    });
  } catch (error) {
    console.error("[CompareChat] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
