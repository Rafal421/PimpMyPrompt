import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenAI;

  constructor() {
    super({
      name: "Gemini",
      defaultModel: "gemini-2.5-flash",
      allowedModels: getAllowedModelsForProvider("gemini"),
    });
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }

  protected async callAI(
    prompt: string,
    model: string,
    maxTokens: number,
    history?: { role: "user" | "assistant"; content: string }[],
  ): Promise<string> {
    const contents: any[] = [];

    if (history && history.length > 0) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      });
    }

    contents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await this.client.models.generateContent({
      model,
      contents,
      config: {
        maxOutputTokens: maxTokens,
      },
    });

    return response.text || "";
  }
}

const geminiProvider = new GeminiProvider();
export { geminiProvider };

export async function POST(req: NextRequest) {
  return geminiProvider.handleRequest(req);
}
