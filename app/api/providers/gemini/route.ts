import { NextRequest } from "next/server";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class GeminiProvider extends BaseAIProvider {
  constructor() {
    super({
      name: "Gemini",
      defaultModel: "gemini-2.5-flash",
      allowedModels: getAllowedModelsForProvider("gemini"),
    });
  }

  protected async callAI(
    prompt: string,
    model: string
  ): Promise<string> {
    // ✅ Use Authorization header instead of query-string key
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GEMINI_API_KEY}`,
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
