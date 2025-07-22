import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model } = await req.json();
    const selectedModel = model || "claude-3-5-sonnet-20241022";

    console.log("[Anthropic] Using model:", selectedModel);

    if (!action || !question) {
      return NextResponse.json(
        { error: "Action and question are required" },
        { status: 400 }
      );
    }

    async function callAnthropic(prompt: string) {
      const msg = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Wyciągnij tekst z odpowiedzi Claude
      const textBlock = msg.content.find((block) => block.type === "text");
      return textBlock?.text || "";
    }

    if (action === "clarify") {
      const clarifyPrompt = `Jako asystent AI, zadaj kilka (3-5) precyzujących pytań użytkownikowi, aby lepiej zrozumieć jego intencję. Wypisz tylko pytania, bez żadnych wstępów, podsumowań ani podziękowań. Każde pytanie w osobnej linii.\n\nPytanie użytkownika: ${question}`;
      const content = await callAnthropic(clarifyPrompt);
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
      const content = await callAnthropic(improvePrompt);
      const prompt = content?.trim() || "";
      return NextResponse.json({ prompt });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error calling Anthropic:", error);
    return NextResponse.json(
      { error: "Failed to get response from Anthropic" },
      { status: 500 }
    );
  }
}
