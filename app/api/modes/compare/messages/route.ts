import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { COMPARE_MODELS } from "@/lib/compare-config";

const PROVIDER_COLUMN: Record<string, string> = {
  openai: "openai_response",
  anthropic: "anthropic_response",
  gemini: "gemini_response",
  grok: "grok_response",
  perplexity: "perplexity_response",
  deepseek: "deepseek_response",
};

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chat_id");

    if (!chatId) {
      return NextResponse.json(
        { error: "chat_id is required" },
        { status: 400 }
      );
    }

    const { data: sessions, error } = await supabase
      .from("compare_sessions")
      .select("*")
      .eq("chat_id", chatId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    const messages = sessions.flatMap((session) => {
      const compareResponses = COMPARE_MODELS.map((model) => {
        const column = PROVIDER_COLUMN[model.provider];
        const value = session[column];

        if (!value) return null;

        const isError =
          typeof value === "string" && value.startsWith("[ERROR]");

        return {
          provider: model.provider,
          modelId: model.id,
          model: model.name,
          response: isError ? value.replace("[ERROR] ", "") : value,
          success: !isError,
        };
      }).filter(Boolean);

      return [
        {
          from: "user",
          text: session.user_question,
        },
        {
          from: "bot",
          text: "",
          compareResponses,
          summary: session.summary,
        },
      ];
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[COMPARE_MESSAGES]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
