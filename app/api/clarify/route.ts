import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

// Helper function to get the appropriate AI client
const getAIClient = (provider: string) => {
  switch (provider) {
    case "anthropic":
      return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    case "gemini":
      return new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    case "openai":
      return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    case "perplexity":
      return new OpenAI({
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: "https://api.perplexity.ai",
      });
    case "deepseek":
      return new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: "https://api.deepseek.com/v1",
      });
    case "grok":
      return new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: "https://api.x.ai/v1",
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export async function POST(req: Request) {
  try {
    const { message, provider, model } = await req.json();

    if (!message || !provider || !model) {
      return NextResponse.json(
        { error: "Missing required fields: message, provider, or model" },
        { status: 400 }
      );
    }

    const ai = getAIClient(provider);
    let responseContent = "";

    if (provider === "anthropic" && ai instanceof Anthropic) {
      const response = await ai.messages.create({
        model,
        max_tokens: 1024,
        messages: [{ role: "user", content: message }],
      });
      const firstBlock = response.content[0];
      responseContent =
        firstBlock.type === "text" && "text" in firstBlock
          ? firstBlock.text
          : "";
    } else if (provider === "gemini" && ai instanceof GoogleGenerativeAI) {
      const generativeModel = ai.getGenerativeModel({ model });
      const result = await generativeModel.generateContent(message);
      const response = await result.response;
      responseContent = response.text();
    } else if (
      (provider === "openai" ||
        provider === "perplexity" ||
        provider === "deepseek" ||
        provider === "grok") &&
      ai instanceof OpenAI
    ) {
      const response = await ai.chat.completions.create({
        model,
        messages: [{ role: "user", content: message }],
      });
      responseContent = response.choices[0].message.content || "";
    } else {
      return NextResponse.json(
        { error: `Provider ${provider} is not supported for clarification.` },
        { status: 400 }
      );
    }

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error("Error in /api/clarify:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to get response from AI.", details: errorMessage },
      { status: 500 }
    );
  }
}
