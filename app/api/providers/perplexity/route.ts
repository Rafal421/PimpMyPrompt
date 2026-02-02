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

    const completion = await this.perplexity.chat.completions.create({
      model,
      messages,
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
