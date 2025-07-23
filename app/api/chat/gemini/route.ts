import { NextRequest, NextResponse } from "next/server";

// Helper function to parse questions with options
function parseQuestionsWithOptions(content: string) {
  const questions = [];
  const lines = content.split("\n");
  let currentQuestion = null;
  let currentOptions = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if line starts with "PYTANIE" followed by number and colon
    if (trimmedLine.match(/^PYTANIE\s+\d+:/)) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length > 0) {
        questions.push({
          question: currentQuestion,
          options: [...currentOptions],
        });
      }
      // Start new question
      currentQuestion = trimmedLine.replace(/^PYTANIE\s+\d+:\s*/, "");
      currentOptions = [];
    }
    // Check if line is an option (A), B), C))
    else if (trimmedLine.match(/^[A-C]\)/)) {
      const option = trimmedLine.replace(/^[A-C]\)\s*/, "");
      if (option) {
        currentOptions.push(option);
      }
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentOptions.length > 0) {
    questions.push({
      question: currentQuestion,
      options: [...currentOptions],
    });
  }

  return questions;
}

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
      const content = await callGemini(clarifyPrompt);
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
