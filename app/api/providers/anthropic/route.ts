import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { BaseAIProvider } from "@/lib/providers/BaseAIProvider";
import { getAllowedModelsForProvider } from "@/lib/providers/ai-config";

class AnthropicProvider extends BaseAIProvider {
  private anthropic: Anthropic;

  constructor() {
    super({
      name: "Anthropic",
      defaultModel: "claude-sonnet-4-5-20250929",
      allowedModels: getAllowedModelsForProvider("anthropic"),
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  protected async callAI(
    prompt: string,
    model: string,
    maxTokens: number
  ): Promise<string> {
    const msg = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((block) => block.type === "text");
    return textBlock?.text || "";
  }
}

const anthropicProvider = new AnthropicProvider();
export { anthropicProvider };

export async function POST(req: NextRequest) {
  return anthropicProvider.handleRequest(req);
}
