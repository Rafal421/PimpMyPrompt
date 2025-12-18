import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class PerplexityProvider extends BaseAIProvider {
  private perplexity: OpenAI;

  constructor() {
    super({
      name: "Perplexity",
      defaultModel: "sonar-pro",
      allowedModels: getAllowedModelsForProvider("perplexity"),
    });

    this.perplexity = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });
  }

  protected async callAI(
    prompt: string,
    model: string,
    maxTokens: number
  ): Promise<string> {
    const completion = await this.perplexity.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  }
}

const perplexityProvider = new PerplexityProvider();
export { perplexityProvider };

export async function POST(req: NextRequest) {
  return perplexityProvider.handleRequest(req);
}
