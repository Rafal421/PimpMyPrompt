import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, model } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const selectedModel = model || "gpt-3.5-turbo";

    console.log("Wysyłam do OpenAI:", {
      model: selectedModel,
      messages: [{ role: "user", content: message }],
      max_tokens: 1000,
    });

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 25,
    });

    const response = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: "Failed to get response from GPT" },
      { status: 500 }
    );
  }
} 