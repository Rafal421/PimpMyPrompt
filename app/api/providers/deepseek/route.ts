import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class DeepSeekProvider extends BaseAIProvider {
  private deepseek: OpenAI;

  constructor() {
    super({
      name: "DeepSeek",
      defaultModel: "deepseek-chat",
      allowedModels: getAllowedModelsForProvider("deepseek"),
    });

    this.deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
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

    const completion = await this.deepseek.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  }
}

const deepSeekProvider = new DeepSeekProvider();
export { deepSeekProvider };

export async function POST(req: NextRequest) {
  return deepSeekProvider.handleRequest(req);
}
