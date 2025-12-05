import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";

class OpenAIProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor() {
    super({
      name: "OpenAI",
      defaultModel: "gpt-4o"
    });
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async callAI(prompt: string, model: string, maxTokens: number = 1000): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
    });
    
    return completion.choices[0]?.message?.content || "";
  }
}

const openAIProvider = new OpenAIProvider();

export async function POST(req: NextRequest) {
  return openAIProvider.handleRequest(req);
}
