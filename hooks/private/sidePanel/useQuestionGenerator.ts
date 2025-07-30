import { useCallback } from "react";
import { apiServices } from "@/lib/services/api";
import type { Provider, QuestionData } from "@/lib/types";

interface UseQuestionGeneratorProps {
  provider: Provider;
}

export function useQuestionGenerator({ provider }: UseQuestionGeneratorProps) {
  const generateClarifyingQuestions = useCallback(
    async (question: string): Promise<QuestionData[]> => {
      return apiServices.questions.generateClarifying(question, provider);
    },
    [provider]
  );
  return {
    generateClarifyingQuestions,
  };
}
