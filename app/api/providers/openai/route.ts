import { NextRequest } from "next/server";
import OpenAI from "openai";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class OpenAIProvider extends BaseAIProvider {
  private openai: OpenAI;

  constructor() {
    super({
      name: "OpenAI",
      defaultModel: "gpt-4o-mini",
      allowedModels: getAllowedModelsForProvider("openai"),
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async callAI(
    prompt: string,
    model: string,
    maxTokens: number,
    history?: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Add history if available
    if (history && history.length > 0) {
      history.forEach((msg) => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Add current prompt
    messages.push({ role: "user", content: prompt });

    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content || "";
  }
}

const openAIProvider = new OpenAIProvider();
export { openAIProvider };

export async function POST(req: NextRequest) {
  return openAIProvider.handleRequest(req);
}
