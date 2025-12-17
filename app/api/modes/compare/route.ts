import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS } from "@/lib/compare-config";
import {
  createCompareAnalysisPrompt,
  TOKEN_LIMITS,
} from "@/lib/providers/ai-helpers";
import OpenAI from "openai";

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

    // Make API calls to all providers in parallel
    const responses = await Promise.allSettled(
      COMPARE_MODELS.map(async (model) => {
        try {
          const baseUrl =
            process.env.NODE_ENV === "development"
              ? "http://localhost:3000"
              : process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : "";

          const apiUrl = `${baseUrl}/api/providers/${model.provider}`;

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: request.headers.get("Cookie") || "",
            },
            body: JSON.stringify({
              message,
              model: model.id,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[CompareChat] ${model.provider} error:`, errorText);
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
      })
    );

    // Process results
    const results = responses.map((result, index) => {
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

    let summary = "";
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const summaryPrompt = createCompareAnalysisPrompt(message, results);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Using cheapest OpenAI model
        messages: [{ role: "user", content: summaryPrompt }],
        max_tokens: TOKEN_LIMITS.GENERAL,
      });

      summary = completion.choices[0]?.message?.content || "";
    } catch (error) {
      console.error("[CompareChat] Error generating summary:", error);
    }

    // Create the record with all responses in separate columns
    const responseData: any = {
      user_id: user.id,
      chat_id: chat_id || null,
      user_question: message,
      summary: summary || null,
    };

    results.forEach((result) => {
      switch (result.provider) {
        case "openai":
          responseData.openai_response = result.response;
          break;
        case "anthropic":
          responseData.anthropic_response = result.response;
          break;
        case "gemini":
          responseData.gemini_response = result.response;
          break;
        case "deepseek":
          responseData.deepseek_response = result.response;
          break;
        case "perplexity":
          responseData.perplexity_response = result.response;
          break;
        case "grok":
          responseData.grok_response = result.response;
          break;
        default:
          console.warn(`[CompareChat] Unknown provider: ${result.provider}`);
      }
    });

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
