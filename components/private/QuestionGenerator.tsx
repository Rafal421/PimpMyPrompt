"use client";
import { useCallback } from "react";
import { createClarifyPrompt, createImprovePrompt } from "@/lib/ai-helpers";

interface QuestionData {
  question: string;
  options: string[];
}

interface UseQuestionGeneratorProps {
  provider: string;
  getQuestionProviderById: (provider: string) =>
    | {
        endpoint?: string;
        model?: string;
      }
    | undefined;
  getProviderEndpoint: (provider: string) => string;
}

export const useQuestionGenerator = ({
  provider,
  getQuestionProviderById,
  getProviderEndpoint,
}: UseQuestionGeneratorProps) => {
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
      const modelToUse =
        action === "clarify"
          ? questionProvider?.model || DEFAULT_MODEL
          : questionProvider?.model || DEFAULT_MODEL;
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
      
      const result = action === "clarify" && data.questions
        ? { questionsWithOptions: data.questions }
        : data;
      
      return result;
    },
    [provider, getQuestionProviderById, getProviderEndpoint]
  );

  const generateClarifyingQuestions = useCallback(
    async (question: string): Promise<QuestionData[]> => {
      try {
        const data = await callProvider("clarify", { question });
        
        const questions = data.questionsWithOptions || [];
        
        return questions;
      } catch (error) {
        console.error("Error generating clarifying questions:", error);
        return [];
      }
    },
    [callProvider]
  );

  return {
    generateClarifyingQuestions,
    callProvider,
  };
};

// Component for handling question generation UI
interface QuestionGeneratorProps {
  onQuestionsGenerated: (questions: QuestionData[]) => void;
  onError: (error: string) => void;
  provider: string;
  getQuestionProviderById: (provider: string) =>
    | {
        endpoint?: string;
        model?: string;
      }
    | undefined;
  getProviderEndpoint: (provider: string) => string;
}

export const QuestionGenerator = ({
  onQuestionsGenerated,
  onError,
  provider,
  getQuestionProviderById,
  getProviderEndpoint,
}: QuestionGeneratorProps) => {
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getQuestionProviderById,
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

  return {
    handleQuestionGeneration,
  };
};
