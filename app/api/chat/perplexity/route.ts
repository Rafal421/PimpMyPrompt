import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/ai-helpers";
import { handleError, ValidationError } from "@/lib/error-handler";

const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model, message } = await req.json();
    const selectedModel = model || "sonar-pro";

    console.log("[Perplexity] Using model:", selectedModel);

    const callPerplexity = async (prompt: string, maxTokens: number) => {
      const completion = await perplexity.chat.completions.create({
        model: selectedModel,
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxTokens,
      });
      return completion.choices[0]?.message?.content || "";
    };

    // Handle message format (from ChatClient)
    if (message) {
      const content = await callPerplexity(message, TOKEN_LIMITS.GENERAL);
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
      const content = await callPerplexity(
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
      const content = await callPerplexity(
        createImprovePrompt(question, answers),
        TOKEN_LIMITS.IMPROVE
      );
      return NextResponse.json({ prompt: content.trim() });
    }

    throw new ValidationError("Invalid action");
  } catch (error) {
    return handleError(error, "Perplexity");
  }
}
