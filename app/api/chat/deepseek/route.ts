import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
} from "@/lib/ai-helpers";

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
      const clarifyPrompt = createClarifyPrompt(question);
      const completion = await deepseek.chat.completions.create({
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
      const answerSummary = answers;
      const improvePrompt = createImprovePrompt(question, answers);
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
