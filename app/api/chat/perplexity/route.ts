import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, model } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }



    // Log request
    console.log("Wysyłam do Perplexity:", {
      model: model || "sonar-pro",
      messages: [{ role: "user", content: message }],
      max_tokens: 25,
    });

    const perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "sonar",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 25,
      }),
    });

    if (!perplexityRes.ok) {
      const error = await perplexityRes.text();
      console.error("Perplexity API error:", error);
      return NextResponse.json({ error }, { status: perplexityRes.status });
    }

    const data = await perplexityRes.json();
    const response =
      data?.choices?.[0]?.message?.content || "Brak odpowiedzi od Perplexity.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Błąd wywołania Perplexity:", error);
    return NextResponse.json(
      { error: "Błąd połączenia z Perplexity API" },
      { status: 500 }
    );
  }
}