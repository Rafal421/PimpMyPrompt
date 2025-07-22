import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model } = await req.json();
    const selectedModel = model || "deepseek-chat";

    console.log("[DeepSeek] Using model:", selectedModel);

    if (!action || !question) {
      return NextResponse.json(
        { error: "Action and question are required" },
        { status: 400 }
      );
    }

    if (action === "clarify") {
      const clarifyPrompt = `Jako asystent AI, zadaj kilka (3-5) precyzujących pytań użytkownikowi, aby lepiej zrozumieć jego intencję. Wypisz tylko pytania, bez żadnych wstępów, podsumowań ani podziękowań. Każde pytanie w osobnej linii.\n\nPytanie użytkownika: ${question}`;
      const completion = await deepseek.chat.completions.create({
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
        .map((a: string, i: number) => `Pytanie: ${i + 1}\nOdpowiedź: ${a}`)
        .join("\n\n");
      const improvePrompt = `Na podstawie poniższego pytania użytkownika oraz odpowiedzi na pytania precyzujące, wygeneruj ulepszony prompt do AI:\n\nPytanie użytkownika:\n${question}\n\nOdpowiedzi:\n${answerSummary}\n\nWygeneruj najlepszy możliwy prompt.`;
      const completion = await deepseek.chat.completions.create({
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
    console.error("Error calling DeepSeek:", error);
    return NextResponse.json(
      { error: "Failed to get response from DeepSeek" },
      { status: 500 }
    );
  }
}
