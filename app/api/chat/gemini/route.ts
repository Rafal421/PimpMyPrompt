import { NextRequest, NextResponse } from "next/server";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
} from "@/lib/ai-helpers";
import { handleError, ValidationError } from "@/lib/error-handler";

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model, message } = await req.json();
    const selectedModel = model || "gemini-2.5-flash-lite-preview-06-17";

    console.log("[Gemini] Using model:", selectedModel);

    const callGemini = async (prompt: string) => {
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
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    };

    // Handle message format (from ChatClient)
    if (message) {
      const content = await callGemini(message);
      const questions = parseQuestionsWithOptions(content);
      return NextResponse.json(
        questions.length > 0 ? { questions } : { response: content }
      );
    }

    // Handle legacy action format
    if (!action || !question) {
      throw new ValidationError("Action and question are required");
    }

    if (action === "clarify") {
      const content = await callGemini(createClarifyPrompt(question));
      const questions = parseQuestionsWithOptions(content);
      return NextResponse.json({ questions });
    }

    if (action === "improve") {
      if (!answers?.length) {
        throw new ValidationError("Answers are required for improve action");
      }
      const content = await callGemini(createImprovePrompt(question, answers));
      return NextResponse.json({ prompt: content.trim() });
    }

    throw new ValidationError("Invalid action");
  } catch (error) {
    return handleError(error, "Gemini");
  }
}
