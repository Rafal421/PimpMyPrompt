import { NextRequest } from "next/server";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class GeminiProvider extends BaseAIProvider {
  private apiKey: string;

  constructor() {
    super({
      name: "Gemini",
      defaultModel: "gemini-2.5-flash",
      allowedModels: getAllowedModelsForProvider("gemini"),
    });
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  protected async callAI(prompt: string, model: string): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Gemini API error (${res.status}): ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
}

const geminiProvider = new GeminiProvider();

export async function POST(req: NextRequest) {
  return geminiProvider.handleRequest(req);
}
