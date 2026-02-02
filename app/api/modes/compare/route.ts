import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS, PROVIDER_COLUMN } from "@/lib/chat/compare-config";
import {
  createCompareAnalysisPrompt,
  TOKEN_LIMITS,
} from "@/lib/providers/ai-helpers";
import OpenAI from "openai";
import { DatabaseResponseData, ProviderResponse } from "@/lib/shared/types";
import { AuditLogger } from "@/lib/logging/audit-logger";
import { openAIProvider } from "@/app/api/providers/openai/route";
import { anthropicProvider } from "@/app/api/providers/anthropic/route";
import { geminiProvider } from "@/app/api/providers/gemini/route";
import { deepSeekProvider } from "@/app/api/providers/deepseek/route";
import { perplexityProvider } from "@/app/api/providers/perplexity/route";
import { grokProvider } from "@/app/api/providers/grok/route";

function getProviderInstance(providerName: string) {
  const providers: Record<string, any> = {
    openai: openAIProvider,
    anthropic: anthropicProvider,
    gemini: geminiProvider,
    deepseek: deepSeekProvider,
    perplexity: perplexityProvider,
    grok: grokProvider,
  };
  return providers[providerName];
}

// ✅ Helper: Call a single provider directly (no HTTP overhead)
async function callProvider(
  model: (typeof COMPARE_MODELS)[number],
  message: string
): Promise<ProviderResponse> {
  try {
    const provider = getProviderInstance(model.provider);

    if (!provider) {
      throw new Error(`Unknown provider: ${model.provider}`);
    }

    // Direct method call - no HTTP request!
    const response = await provider.generateResponse(
      message,
      model.id,
      TOKEN_LIMITS.GENERAL
    );

    return {
      model: model.name,
      modelId: model.id,
      provider: model.provider,
      response: response || "No response",
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
      COMPARE_MODELS.map((model) => callProvider(model, message))
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
      await AuditLogger.log("COMPARE_SESSION_FAILED", user.id, {
        reason: "Database insert failed",
        chat_id,
      });
      throw new Error(`Failed to save session: ${sessionError.message}`);
    }

    await AuditLogger.log("COMPARE_SESSION_CREATED", user.id, {
      session_id: sessionData.id,
      chat_id,
      providers_count: results.length,
      successful_providers: results.filter((r) => r.success).length,
    });

    return NextResponse.json({
      success: true,
      responses: results,
      summary,
      session_id: sessionData.id,
    });
  } catch (error) {
    console.error("[CompareChat] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    const response: { error: string; debug?: string } = {
      error: "Failed to process comparison request",
    };

    if (process.env.NODE_ENV === "development") {
      response.debug = errorMessage;
    }

    return NextResponse.json(response, { status: 500 });
  }
}
