// hooks/private/sidePanel/useHandleQuestionGeneration.ts
import { useQuestionGenerator } from "./useQuestionGenerator";
import type { QuestionData, Provider } from "@/lib/types";

interface UseHandleQuestionGenerationProps {
  provider: Provider;
  getProviderEndpoint: (provider: string) => string;
  onQuestionsGenerated: (questions: QuestionData[]) => void;
  onError: (error: string) => void;
}

export function useHandleQuestionGeneration({
  provider,
  getProviderEndpoint,
  onQuestionsGenerated,
  onError,
}: UseHandleQuestionGenerationProps) {
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getProviderEndpoint,
  });

  const handleQuestionGeneration = async (question: string) => {
    try {
      const questions = await generateClarifyingQuestions(question);
      if (questions.length > 0) {
        onQuestionsGenerated(questions);
      } else {
        onError("No clarifying questions were generated.");
      }
    } catch (error) {
      console.error("Question generation failed:", error);
      onError("Failed to generate clarifying questions. Please try again.");
    }
  };

  return { handleQuestionGeneration };
}
