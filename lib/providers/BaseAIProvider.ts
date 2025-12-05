import { NextRequest, NextResponse } from "next/server";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/ai-helpers";
import { handleError, ValidationError } from "@/lib/error-handler";
import { auditAIRequest } from "@/lib/ai-audit";

export interface AIProviderConfig {
  name: string;
  defaultModel: string;
}

export interface AIRequestBody {
  action?: string;
  question?: string;
  answers?: string[];
  model?: string;
  message?: string;
}

export abstract class BaseAIProvider {
  protected config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  protected abstract callAI(
    prompt: string,
    model: string,
    maxTokens?: number
  ): Promise<string>;

  public async handleRequest(req: NextRequest): Promise<NextResponse> {
    try {
      const { action, question, answers, model, message }: AIRequestBody =
        await req.json();
      const selectedModel = model || this.config.defaultModel;

      console.log(`[${this.config.name}] Using model:`, selectedModel);

      // Handle message format (from ChatClient)
      if (message) {
        await auditAIRequest(
          this.config.name.toLowerCase(),
          selectedModel,
          "message",
          "user",
          { message_length: message?.length }
        );

        const content = await this.callAI(
          message,
          selectedModel,
          TOKEN_LIMITS.GENERAL
        );
        const questions = parseQuestionsWithOptions(content);

        return NextResponse.json(
          questions.length > 0 ? { questions } : { response: content }
        );
      }

      // Handle legacy action format
      if (!action || !question) {
        throw new ValidationError("Action and question are required");
      }

      await auditAIRequest(
        this.config.name.toLowerCase(),
        selectedModel,
        action,
        "user",
        { question_length: question?.length }
      );

      let content: string;

      switch (action) {
        case "clarify":
          content = await this.callAI(
            createClarifyPrompt(question),
            selectedModel,
            TOKEN_LIMITS.CLARIFY
          );
          const questions = parseQuestionsWithOptions(content);
          return NextResponse.json({ questions });

        case "improve":
          if (!answers) {
            throw new ValidationError(
              "Answers are required for improve action"
            );
          }
          content = await this.callAI(
            createImprovePrompt(question, answers),
            selectedModel,
            TOKEN_LIMITS.IMPROVE
          );
          return NextResponse.json({ response: content });

        default:
          throw new ValidationError(`Unknown action: ${action}`);
      }
    } catch (error) {
      return handleError(error, this.config.name);
    }
  }
}
