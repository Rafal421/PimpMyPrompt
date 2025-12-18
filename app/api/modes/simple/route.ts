import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import OpenAI from "openai";

class SimpleChatProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor() {
    super({
      name: "SimpleChat",
      defaultModel: "gpt-4o-mini",
      allowedModels: ["gpt-4o-mini"],
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async callAI(prompt: string, model: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0]?.message?.content || "";
  }
}

const simpleChatProvider = new SimpleChatProvider();

export async function POST(request: NextRequest) {
  try {
    // Parse request to get the message and chat_id
    const { message, chat_id } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use BaseAIProvider infrastructure for auth, rate limiting, etc.
    const providerRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify({ message }),
    });

    const response = await simpleChatProvider.handleRequest(
      providerRequest as NextRequest
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    if (chat_id && data.response) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("messages").insert({
          chat_id,
          user_id: user.id,
          from: "bot",
          content: data.response,
        });
      }
    }

    return NextResponse.json({
      success: true,
      response: data.response,
    });
  } catch (error) {
    console.error("Simple chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
