import { useCallback } from "react";
import {
  createImprovePrompt,
  parseQuestionsWithOptions,
} from "@/lib/providers/ai-helpers";
import { getQuestionProviderById } from "@/lib/providers/ai-config";
import type { QuestionData, Provider } from "@/lib/types";

interface UseQuestionGeneratorProps {
  provider: Provider;
  getProviderEndpoint: (provider: string) => string;
}

export function useQuestionGenerator({
  provider,
  getProviderEndpoint,
}: UseQuestionGeneratorProps) {
  const callProvider = useCallback(
    async (
      action: "clarify" | "improve",
      payload: { question: string; answers?: string[] }
    ) => {
      if (action === "clarify") {
        // Bezpośredni fetch do /api/clarify
        const questionProvider = getQuestionProviderById(provider);
        if (!questionProvider) {
          throw new Error(`Provider ${provider} not found`);
        }

        const response = await fetch("/api/modes/clarify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            question: payload.question,
            model: questionProvider.model,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Check if questions are already parsed by the provider
        if (data.questions && Array.isArray(data.questions)) {
          return data.questions;
        }

        // Fallback to content parsing for legacy responses
        const content = data.response || data.content;
        if (!content) {
          throw new Error("No content in response");
        }

        const questionsWithOptions = parseQuestionsWithOptions(content);
        if (questionsWithOptions.length === 0) {
          throw new Error(
            "Unable to generate clarifying questions. Please try rephrasing your question with more detail."
          );
        }

        return questionsWithOptions;
      }
      const endpoint = getProviderEndpoint(provider);
      const promptContent = createImprovePrompt(
        payload.question,
        payload.answers || []
      );

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptContent }), // Model jest teraz obsługiwany po stronie serwera
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API call failed");
      }

      return response.json();
    },
    [provider, getProviderEndpoint]
  );

  const generateClarifyingQuestions = useCallback(
    async (question: string): Promise<QuestionData[]> => {
      const questions = await callProvider("clarify", { question });
      return questions || [];
    },
    [callProvider]
  );

  return {
    callProvider,
    generateClarifyingQuestions,
  };
}
