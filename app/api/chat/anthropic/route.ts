import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/ai-helpers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { action, question, answers, model, message } = await req.json();
    const selectedModel = model || "claude-3-5-sonnet-20241022";

    console.log("[Anthropic] Using model:", selectedModel);

    const callAnthropic = async (prompt: string) => {
      const msg = await anthropic.messages.create({
        model: selectedModel,
        max_tokens: TOKEN_LIMITS.GENERAL,
        messages: [{ role: "user", content: prompt }],
      });
      const textBlock = msg.content.find((block) => block.type === "text");
      return textBlock?.text || "";
    };

    // Handle message format (from ChatClient)
    if (message) {
      const content = await callAnthropic(message);
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
      const content = await callAnthropic(createClarifyPrompt(question));
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
      const content = await callAnthropic(
        createImprovePrompt(question, answers)
      );
      return NextResponse.json({ prompt: content.trim() });
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
