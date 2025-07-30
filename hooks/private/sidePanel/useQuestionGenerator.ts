import { useCallback } from "react";
import { createClarifyPrompt, createImprovePrompt } from "@/lib/ai-helpers";
import type { QuestionData } from "@/lib/types";

interface UseQuestionGeneratorProps {
  provider: string;
  getQuestionProviderById: (
    provider: string
  ) => { endpoint?: string; model?: string } | undefined;
  getProviderEndpoint: (provider: string) => string;
}

export function useQuestionGenerator({
  provider,
  getQuestionProviderById,
  getProviderEndpoint,
}: UseQuestionGeneratorProps) {
  const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

  const callProvider = useCallback(
    async (
      action: "clarify" | "improve",
      payload: { question: string; answers?: string[] }
    ) => {
      const questionProvider = getQuestionProviderById(provider);
      const endpoint =
        action === "clarify"
          ? questionProvider?.endpoint || "/api/chat/anthropic"
          : getProviderEndpoint(provider);

      const modelToUse = questionProvider?.model || DEFAULT_MODEL;
      const promptContent =
        action === "clarify"
          ? createClarifyPrompt(payload.question)
          : createImprovePrompt(payload.question, payload.answers || []);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: promptContent, model: modelToUse }),
      });

      const data = await response.json();

      return action === "clarify" && data.questions
        ? { questionsWithOptions: data.questions }
        : data;
    },
    [provider, getQuestionProviderById, getProviderEndpoint]
  );

  const generateClarifyingQuestions = useCallback(
    async (question: string): Promise<QuestionData[]> => {
      try {
        const data = await callProvider("clarify", { question });
        return data.questionsWithOptions || [];
      } catch (error) {
        console.error("Error generating clarifying questions:", error);
        return [];
      }
    },
    [callProvider]
  );

  return {
    callProvider,
    generateClarifyingQuestions,
  };
}
