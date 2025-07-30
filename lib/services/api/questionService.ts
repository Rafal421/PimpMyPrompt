import {
  createClarifyPrompt,
  parseQuestionsWithOptions,
} from "@/lib/ai-helpers";
import { getQuestionProviderById } from "@/lib/ai-config";
import type { Provider, QuestionData } from "@/lib/types";

export class QuestionService {
  async generateClarifyingQuestions(
    question: string,
    provider: Provider
  ): Promise<QuestionData[]> {
    const questionProvider = getQuestionProviderById(provider);
    if (!questionProvider) {
      throw new Error(`Provider ${provider} not found`);
    }

    const clarifyPrompt = createClarifyPrompt(question);

    const response = await fetch("/api/clarify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: clarifyPrompt,
        provider,
        model: questionProvider.model,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.response || data.content;

    if (!content) {
      throw new Error("No content in response");
    }

    const questionsWithOptions = parseQuestionsWithOptions(content);

    if (questionsWithOptions.length === 0) {
      throw new Error("No valid questions generated");
    }

    return questionsWithOptions;
  }
}

export const questionService = new QuestionService();
