import {
  createClarifyPrompt,
  parseQuestionsWithOptions,
} from "@/lib/ai-helpers";
import { getQuestionProviderById } from "@/lib/ai-config";
import type { Provider, QuestionData } from "@/lib/types";

const invalidContentIndicators = [
  "impossible",
  "no discernible meaning",
  "no relevant questions",
  "invalid",
  "meaningless",
  "too short",
  "lacks context",
  "provide more information",
  "not enough context",
  "insufficient information",
];

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
      if (
        invalidContentIndicators.some((indicator) =>
          content.toLowerCase().includes(indicator)
        )
      ) {
        throw new Error(
          "The question provided doesn't contain enough context for clarification. Please provide a more specific and detailed question."
        );
      }

      throw new Error(
        "Unable to generate clarifying questions. Please try rephrasing your question with more detail."
      );
    }

    return questionsWithOptions;
  }
}

export const questionService = new QuestionService();
