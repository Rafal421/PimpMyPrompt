import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS, PROVIDER_COLUMN } from "@/lib/chat/compare-config";
import {
  createCompareAnalysisPrompt,
  TOKEN_LIMITS,
} from "@/lib/providers/ai-helpers";
import { DatabaseResponseData, ProviderResponse } from "@/lib/shared/types";
import { AuditLogger } from "@/lib/logging/audit-logger";

async function callProvider(
  model: (typeof COMPARE_MODELS)[number],
  message: string,
  reqUrl: string,
  cookieHeader: string | null
): Promise<ProviderResponse> {
  try {
    const response = await fetch(
      new URL(`/api/providers/${model.provider}`, reqUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: JSON.stringify({
          message,
          model: model.id,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Provider error: ${response.status}`);
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
  results: ProviderResponse[],
  reqUrl: string,
  cookieHeader: string | null
): Promise<string> {
  const successfulResults = results.filter((r) => r.success);
  if (successfulResults.length < 2) {
    return "";
  }

  try {
    const summaryPrompt = createCompareAnalysisPrompt(
      message,
      successfulResults
    );

    const response = await fetch(new URL("/api/providers/openai", reqUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        message: summaryPrompt,
        model: "gpt-4o-mini",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.response || "";
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, chat_id, selectedProviders } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const modelsToCompare = selectedProviders?.length
      ? COMPARE_MODELS.filter((m) => selectedProviders.includes(m.provider))
      : COMPARE_MODELS;

    if (modelsToCompare.length === 0) {
      return NextResponse.json(
        { error: "At least one provider must be selected" },
        { status: 400 }
      );
    }

    const cookieHeader = request.headers.get("cookie");
    const encoder = new TextEncoder();
    const results: ProviderResponse[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "init",
              models: modelsToCompare.map((m) => ({
                modelId: m.id,
                model: m.name,
                provider: m.provider,
              })),
            })}\n\n`
          )
        );

        const providerPromises = modelsToCompare.map(async (model) => {
          const result = await callProvider(
            model,
            message,
            request.url,
            cookieHeader
          );
          results.push(result);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "response",
                response: result,
              })}\n\n`
            )
          );

          return result;
        });

        await Promise.allSettled(providerPromises);

        const successfulResults = results.filter((r) => r.success);
        if (successfulResults.length >= 2) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "generating_summary",
              })}\n\n`
            )
          );
        }

        const summary = await generateSummary(
          message,
          results,
          request.url,
          cookieHeader
        );

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
        } else {
          await AuditLogger.log("COMPARE_SESSION_CREATED", user.id, {
            session_id: sessionData.id,
            chat_id,
            providers_count: results.length,
            successful_providers: results.filter((r) => r.success).length,
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              summary,
              session_id: sessionData?.id || null,
            })}\n\n`
          )
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
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
