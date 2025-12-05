import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";

class PerplexityProvider extends BaseAIProvider {
  private perplexity: OpenAI;

  constructor() {
    super({
      name: "Perplexity",
      defaultModel: "sonar-pro"
    });
    
    this.perplexity = new OpenAI({
      apiKey: process.env.PERPLEXITY_API_KEY,
      baseURL: "https://api.perplexity.ai",
    });
  }

  protected async callAI(prompt: string, model: string, maxTokens: number = 1000): Promise<string> {
    const completion = await this.perplexity.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });
    
    return completion.choices[0]?.message?.content || "";
  }
}

const perplexityProvider = new PerplexityProvider();

export async function POST(req: NextRequest) {
  return perplexityProvider.handleRequest(req);
}
