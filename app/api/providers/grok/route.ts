import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";

class GrokProvider extends BaseAIProvider {
  private grok: OpenAI;

  constructor() {
    super({
      name: "Grok",
      defaultModel: "grok-beta"
    });
    
    this.grok = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }

  protected async callAI(prompt: string, model: string, maxTokens: number = 1000): Promise<string> {
    const completion = await this.grok.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });
    
    return completion.choices[0]?.message?.content || "";
  }
}

const grokProvider = new GrokProvider();

export async function POST(req: NextRequest) {
  return grokProvider.handleRequest(req);
}
