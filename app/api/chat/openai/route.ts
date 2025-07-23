import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/ai-helpers";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model, message } = await req.json();
    const selectedModel = model || "gpt-4o";

    console.log("[OpenAI] Using model:", selectedModel);

    const callOpenAI = async (prompt: string, maxTokens: number) => {
      const completion = await openai.chat.completions.create({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content || "";
    };

    // Handle message format (from ChatClient)
    if (message) {
      const content = await callOpenAI(message, TOKEN_LIMITS.GENERAL);
      const questions = parseQuestionsWithOptions(content);
      return NextResponse.json(
        questions.length > 0 ? { questions } : { response: content }
      );
    }

    // Handle legacy action format
    if (!action || !question) {
      return NextResponse.json(
        { error: "Action and question are required" },
        { status: 400 }
      );
    }

    if (action === "clarify") {
      const content = await callOpenAI(
        createClarifyPrompt(question),
        TOKEN_LIMITS.CLARIFY
      );
      const questions = parseQuestionsWithOptions(content);
      return NextResponse.json({ questions });
    }

    if (action === "improve") {
      if (!answers?.length) {
        return NextResponse.json(
          { error: "Answers are required for improve action" },
          { status: 400 }
        );
      }
      const content = await callOpenAI(
        createImprovePrompt(question, answers),
        TOKEN_LIMITS.IMPROVE
      );
      return NextResponse.json({ prompt: content.trim() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: "Failed to get response from OpenAI" },
      { status: 500 }
    );
  }
}
