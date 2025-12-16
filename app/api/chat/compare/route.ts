import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS } from "@/lib/compare-config";

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
            response: data.response || "No response",
            success: true,
          };
        } catch (error) {
          console.error(`[CompareChat] Error with ${model.name}:`, error);
          return {
            model: model.name,
            modelId: model.id,
            response: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
            success: false,
          };
        }
      })
    );

    const results = responses.map((result, index) => {
      const model = COMPARE_MODELS[index];
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          model: model.name,
          modelId: model.id,
          response: `Failed to get response: ${result.reason}`,
          success: false,
        };
      }
    });

    if (chat_id) {
      console.log("[CompareChat] Saving to database...");

      const combinedContent = results
        .map((r) => `**${r.model}:**\n${r.response}`)
        .join("\n\n---\n\n");

      await supabase.from("messages").insert({
        chat_id,
        user_id: user.id,
        from: "bot",
        content: combinedContent,
      });

      console.log("[CompareChat] Saved to database successfully");
    }

    return NextResponse.json({
      success: true,
      responses: results,
    });
  } catch (error) {
    console.error("[CompareChat] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
