import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
} from "@/lib/ai-helpers";

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
      const clarifyPrompt = `Jako asystent AI, wygeneruj 3-5 pytań doprecyzowujących z 3 opcjami odpowiedzi każde, aby lepiej zrozumieć intencję użytkownika.

Format odpowiedzi:
PYTANIE 1: [treść pytania]
A) [opcja A]
B) [opcja B] 
C) [opcja C]

PYTANIE 2: [treść pytania]
A) [opcja A]
B) [opcja B]
C) [opcja C]

Pytanie użytkownika: ${question}`;
      const completion = await grok.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: clarifyPrompt,
          },
        ],
        max_tokens: 512,
      });
      const content = completion.choices[0]?.message?.content || "";
      // Parse the structured response
      const questions = parseQuestionsWithOptions(content);
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
