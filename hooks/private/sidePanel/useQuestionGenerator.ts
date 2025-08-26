import { useCallback } from "react";
import { createImprovePrompt } from "@/lib/ai-helpers";
import { apiServices } from "@/lib/services/api";
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
        // Użycie nowego serwisu do generowania pytań
        return apiServices.questions.generateClarifying(
          payload.question,
          provider
        );
      }

      // Logika dla 'improve' pozostaje na razie taka sama,
      // ale można ją również przenieść do serwisu w przyszłości
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
      // callProvider zwraca teraz bezpośrednio QuestionData[] dla akcji 'clarify'
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
