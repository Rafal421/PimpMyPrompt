import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model } = await req.json();
    const selectedModel = model || "gemini-2.5-flash-lite-preview-06-17";

    if (!action || !question) {
      return NextResponse.json(
        { error: "Action and question are required" },
        { status: 400 }
      );
    }

    async function callGemini(prompt: string) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }),
        }
      );

      console.log("[Gemini] Using model:", selectedModel);

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status}`);
      }

      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    if (action === "clarify") {
      const clarifyPrompt = `Jako asystent AI, zadaj kilka (3-5) precyzujących pytań użytkownikowi, aby lepiej zrozumieć jego intencję. Wypisz tylko pytania, bez żadnych wstępów, podsumowań ani podziękowań. Każde pytanie w osobnej linii.\n\nPytanie użytkownika: ${question}`;
      const content = await callGemini(clarifyPrompt);
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
      const prompt = await callGemini(improvePrompt);
      return NextResponse.json({ prompt: prompt.trim() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return NextResponse.json(
      { error: "Failed to get response from Gemini" },
      { status: 500 }
    );
  }
}
