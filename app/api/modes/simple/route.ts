import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const {
      message,
      chat_id,
      history,
      provider = "openai",
      model,
    } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const cookieHeader = request.headers.get("cookie");
    const providerUrl = new URL(`/api/providers/${provider}`, request.url);

    const response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        message,
        history,
        model,
      }),
    });

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
      { status: 500 },
    );
  }
}
