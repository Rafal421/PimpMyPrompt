import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class GrokProvider extends BaseAIProvider {
  private grok: OpenAI;

  constructor() {
    super({
      name: "Grok",
      defaultModel: "grok-3-mini",
      allowedModels: getAllowedModelsForProvider("grok"),
    });

    this.grok = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: "https://api.x.ai/v1",
    });
  }

  protected async callAI(
    prompt: string,
    model: string,
    maxTokens: number,
    history?: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    if (history && history.length > 0) {
      history.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    messages.push({ role: "user", content: prompt });

    const completion = await this.grok.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  }
}

const grokProvider = new GrokProvider();
export { grokProvider };

export async function POST(req: NextRequest) {
  return grokProvider.handleRequest(req);
}
