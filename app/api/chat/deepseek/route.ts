import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/ai-helpers";
import { handleError, ValidationError } from "@/lib/error-handler";

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model, message } = await req.json();
    const selectedModel = model || "deepseek-chat";

    console.log("[DeepSeek] Using model:", selectedModel);

    const callDeepSeek = async (prompt: string, maxTokens: number) => {
      const completion = await deepseek.chat.completions.create({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content || "";
    };

    // Handle message format (from ChatClient)
    if (message) {
      const content = await callDeepSeek(message, TOKEN_LIMITS.GENERAL);
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
      const content = await callDeepSeek(
        createClarifyPrompt(question),
        TOKEN_LIMITS.CLARIFY
      );
      const questions = parseQuestionsWithOptions(content);
      return NextResponse.json({ questions });
    }

    if (action === "improve") {
      if (!answers?.length) {
        throw new ValidationError("Answers are required for improve action");
      }
      const content = await callDeepSeek(
        createImprovePrompt(question, answers),
        TOKEN_LIMITS.IMPROVE
      );
      return NextResponse.json({ prompt: content.trim() });
    }

    throw new ValidationError("Invalid action");
  } catch (error) {
    return handleError(error, "DeepSeek");
  }
}
