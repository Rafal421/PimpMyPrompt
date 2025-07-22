import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model } = await req.json();
    const selectedModel = model || "grok-beta";

    console.log("[Grok] Using model:", selectedModel);

    if (!action || !question) {
      return NextResponse.json(
        { error: "Action and question are required" },
        { status: 400 }
      );
    }

    if (action === "clarify") {
      // Prompt do generowania pytań doprecyzowujących
      const clarifyPrompt = `Jako asystent AI, zadaj kilka (3-5) precyzujących pytań użytkownikowi, aby lepiej zrozumieć jego intencję. Nie odpowiadaj jeszcze na pytanie.\n\nPytanie użytkownika: ${question}`;
      const completion = await grok.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: clarifyPrompt,
          },
        ],
        max_tokens: 256,
      });
      const content = completion.choices[0]?.message?.content || "";
      // Rozbij na linie, wyczyść puste
      const questions = content
        .split("\n")
        .map((q: string) => q.replace(/^\d+\.?\s*/, "").trim())
        .filter((q: string) => q.length > 0);
      return NextResponse.json({ questions });
    }

    if (action === "improve") {
      if (!answers || !Array.isArray(answers)) {
        return NextResponse.json(
          { error: "Answers are required for improve action" },
          { status: 400 }
        );
      }
      const answerSummary = answers
        .map((a, i) => `Pytanie: ${i + 1}\nOdpowiedź: ${a}`)
        .join("\n\n");
      const improvePrompt = `Na podstawie poniższego pytania użytkownika oraz odpowiedzi na pytania precyzujące, wygeneruj ulepszony prompt do AI:\n\nPytanie użytkownika:\n${question}\n\nOdpowiedzi:\n${answerSummary}\n\nWygeneruj najlepszy możliwy prompt.`;
      const completion = await grok.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: improvePrompt,
          },
        ],
        max_tokens: 256,
      });
      const prompt = completion.choices[0]?.message?.content?.trim() || "";
      return NextResponse.json({ prompt });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error calling Grok:", error);
    return NextResponse.json(
      { error: "Failed to get response from Grok" },
      { status: 500 }
    );
  }
}
