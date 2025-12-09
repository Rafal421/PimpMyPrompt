import { NextRequest } from "next/server";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";

class GeminiProvider extends BaseAIProvider {
  constructor() {
    super({
      name: "Gemini",
      defaultModel: "gemini-2.5-flash-lite-preview-06-17",
    });
  }

  protected async callAI(
    prompt: string,
    model: string
  ): Promise<string> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  }
}

const geminiProvider = new GeminiProvider();

export async function POST(req: NextRequest) {
  return geminiProvider.handleRequest(req);
}
