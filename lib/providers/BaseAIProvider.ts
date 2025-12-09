import { NextRequest, NextResponse } from "next/server";
import {
  parseQuestionsWithOptions,
  createClarifyPrompt,
  createImprovePrompt,
  TOKEN_LIMITS,
} from "@/lib/providers/ai-helpers";
import { handleError, ValidationError } from "@/lib/error-handler";
import { auditAIRequest } from "@/lib/providers/ai-audit";
import { createClient } from "@/utils/supabase/server";

export interface AIProviderConfig {
  name: string;
  defaultModel: string;
  allowedModels?: string[];
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

  private async verifyUserAuth(): Promise<string | null> {
    try {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      return user.id;
    } catch {
      return null;
    }
  }

  private async checkRateLimit(userId: string): Promise<boolean> {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("check_user_request_count", {
        p_user_id: userId,
      });

      if (error || !data) {
        console.error("Rate limit check failed:", error);
        return false;
      }

      return data.can_make_request === true;
    } catch (error) {
      console.error("Rate limit check error:", error);
      return false;
    }
  }

  private validateModel(model: string): boolean {
    if (!this.config.allowedModels || this.config.allowedModels.length === 0) {
      return true;
    }
    return this.config.allowedModels.includes(model);
  }

  public async handleRequest(req: NextRequest): Promise<NextResponse> {
    try {
      const userId = await this.verifyUserAuth();
      if (!userId) {
        return NextResponse.json(
          { error: "Unauthorized - please log in" },
          { status: 401 }
        );
      }

      const canProceed = await this.checkRateLimit(userId);
      if (!canProceed) {
        return NextResponse.json(
          {
            error:
              "Rate limit exceeded - 20 requests per 24 hours. Please try again later.",
          },
          { status: 429 }
        );
      }

      const { action, question, answers, model, message }: AIRequestBody =
        await req.json();
      const selectedModel = model || this.config.defaultModel;

      if (!this.validateModel(selectedModel)) {
        throw new ValidationError(
          `Model '${selectedModel}' is not allowed for ${this.config.name}`
        );
      }

      console.log(`[${this.config.name}] Using model:`, selectedModel);

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
