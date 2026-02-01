"use client";
import { useState, useRef } from "react";
import type { Provider, Phase, QuestionData, User } from "@/lib/shared/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import {
  DEFAULT_QUESTION_PROVIDER,
  getQuestionProviderById,
} from "@/lib/providers/ai-config";
import {
  parseQuestionsWithOptions,
  createImprovePrompt,
} from "@/lib/providers/ai-helpers";
import { addTypingMessage } from "@/lib/chat/messageHelpers";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

const TYPING_DELAYS = {
  FIRST_QUESTION: 500,
  NEXT_QUESTION: 300,
  IMPROVED_PROMPT: 500,
  FINAL_RESPONSE: 500,
  ANSWER_PROCESSING: 1000,
} as const;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PMPChatConfig {
  user: User;
  onError?: (error: unknown, context?: string) => void;
}

export function usePMPChat({ user, onError }: PMPChatConfig) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);
  const state = useChatState("Ask a question and I'll help you refine it!");
  const [provider, setProvider] = useState<Provider>(DEFAULT_QUESTION_PROVIDER);
  const [phase, setPhase] = useState<Phase>("init");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [customAnswer, setCustomAnswer] = useState("");
  const messagesEndRef = useAutoScroll(state.messages, 200);

  const {
    incrementUsage,
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  } = useUsageLimit();

  const addBotMessage = (text: string) => {
    state.setMessages((prev) => [...prev, { from: "bot", text }]);
  };

  const addUserMessage = (text: string) => {
    state.setMessages((prev) => [...prev, { from: "user", text }]);
  };

  const sendToSidePanel = async (role: "user" | "bot", text: string) => {
    if (state.chatId) {
      await chatSidePanelRef.current?.sendMessage(state.chatId, role, text);
    }
  };

  const withLoadingAndErrorHandling = <T extends unknown[]>(
    handler: (...args: T) => Promise<void>,
    errorMessage: string,
    errorContext: string,
  ) => {
    return async (...args: T) => {
      if (state.isLoading) return;

      state.setIsLoading(true);
      try {
        await handler(...args);
      } catch (error) {
        onError?.(error, errorContext);
        addBotMessage(errorMessage);
      } finally {
        state.setIsLoading(false);
      }
    };
  };

  const generateClarifyingQuestions = async (question: string) => {
    try {
      const questionProvider = getQuestionProviderById(provider);
      if (!questionProvider) {
        throw new Error(`Provider ${provider} not found`);
      }

      const response = await fetch("/api/modes/clarify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          question,
          model: questionProvider.recommendedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        return data.questions;
      }

      const content = data.response || data.content;
      if (!content) {
        throw new Error("No content in response");
      }

      const questionsWithOptions = parseQuestionsWithOptions(content);
      if (questionsWithOptions.length === 0) {
        throw new Error(
          "Unable to generate clarifying questions. Please try rephrasing your question with more detail.",
        );
      }

      return questionsWithOptions;
    } catch (error) {
      onError?.(error, "generating clarifying questions");
      throw error;
    }
  };

  const startQuestionFlow = async (
    question: string,
    currentChatId: string | null,
  ) => {
    setOriginalQuestion(question);
    state.setInput("");

    try {
      const questionsWithOptions = await generateClarifyingQuestions(question);

      if (questionsWithOptions.length > 0) {
        setQuestionsData(questionsWithOptions);
        setCurrentQuestionIndex(0);
        setClarifyingAnswers([]);

        const firstQuestion = questionsWithOptions[0].question;

        await delay(TYPING_DELAYS.FIRST_QUESTION);

        addTypingMessage(
          state.setMessages,
          firstQuestion,
          () =>
            setTimeout(
              () => setPhase("clarifying"),
              TYPING_DELAYS.NEXT_QUESTION,
            ),
          () => state.setIsLoading(false),
        );

        await sendToSidePanel("bot", firstQuestion);
      }
    } catch (error) {
      onError?.(error, "generating clarifying questions");
      addBotMessage(
        "I encountered a problem while generating clarifying questions. Please try rephrasing your question or try again.",
      );
    }
  };

  const generateImprovedPrompt = async () => {
    if (!state.chatId) return;

    setPhase("improving");
    await delay(700);
    state.setIsLoading(true);

    const questionProvider = getQuestionProviderById(provider);
    const currentModel = questionProvider?.recommendedModel || DEFAULT_MODEL;

    try {
      const response = await fetch(`/api/providers/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "improve",
          question: originalQuestion,
          answers: clarifyingAnswers,
          model: currentModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate improved prompt",
        );
      }

      const data = await response.json();
      const prompt = data.response;

      if (typeof prompt !== "string") {
        throw new Error("Failed to generate improved prompt from API.");
      }

      setImprovedPrompt(prompt);

      addTypingMessage(
        state.setMessages,
        prompt,
        () => {
          setTimeout(
            () => setPhase("model-selection"),
            TYPING_DELAYS.IMPROVED_PROMPT,
          );
        },
        undefined,
        true,
      );

      await sendToSidePanel("bot", prompt);
      state.setIsLoading(false);
    } catch (error) {
      state.setIsLoading(false);
      onError?.(error, "generating improved prompt");
      addBotMessage(
        "I encountered a problem while generating the improved prompt. Please try again or modify your answers.",
      );
    }
  };

  const proceedToNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questionsData.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionsData[nextIndex].question;

      addTypingMessage(
        state.setMessages,
        nextQuestion,
        () =>
          setTimeout(() => setPhase("clarifying"), TYPING_DELAYS.NEXT_QUESTION),
        () => state.setIsLoading(false),
      );

      await sendToSidePanel("bot", nextQuestion);
    } else {
      await generateImprovedPrompt();
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!state.chatId || !answer.trim() || phase === "improving") return;

    addUserMessage(answer);
    await sendToSidePanel("user", answer);
    setClarifyingAnswers([...clarifyingAnswers, answer]);
    setCustomAnswer("");
    await delay(100);
    setPhase("improving");
    await delay(700);
    state.setIsLoading(true);

    try {
      await delay(Math.max(0, TYPING_DELAYS.ANSWER_PROCESSING - 700));
      await proceedToNextQuestion();
    } catch (error) {
      onError?.(error, "submitting answer");
      addBotMessage(
        "I encountered a problem processing your answer. Please try again.",
      );
      state.setIsLoading(false);
    }
  };

  const handleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string,
  ) => {
    if (!state.chatId || !improvedPrompt) return;

    const canProceed = await incrementUsage();
    if (!canProceed) {
      addBotMessage(
        "You've reached your hourly limit of 20 requests. Please wait for the next hour or upgrade your plan.",
      );
      return;
    }

    const choiceText = `I choose: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    addUserMessage(choiceText);
    await sendToSidePanel("user", choiceText);

    setPhase("final-response");
    await delay(700);
    state.setIsLoading(true);

    try {
      const response = await fetch(`/api/providers/${selectedProvider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: improvedPrompt,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate response");
      }

      const data = await response.json();
      const finalResponse = data.response;

      if (typeof finalResponse !== "string") {
        throw new Error("Invalid response format from AI provider.");
      }

      addTypingMessage(
        state.setMessages,
        finalResponse,
        () => {
          setTimeout(() => setPhase("done"), TYPING_DELAYS.FINAL_RESPONSE);
        },
        undefined,
        true,
      );

      await sendToSidePanel("bot", finalResponse);
      state.setIsLoading(false);
    } catch (error) {
      state.setIsLoading(false);
      onError?.(error, "generating final response");
      addBotMessage(
        "I encountered a problem while generating the final response. Please try selecting a different model or try again.",
      );
    }
  };

  const resetSession = () => {
    state.reset("Ask a question and I'll help you refine it!");
    setPhase("init");
    setOriginalQuestion("");
    setImprovedPrompt("");
    setClarifyingAnswers([]);
    setCurrentQuestionIndex(0);
    setQuestionsData([]);
    setCustomAnswer("");
  };

  const handleSend = async () => {
    if (!state.input.trim() || state.isLoading) return;

    state.setIsLoading(true);

    await checkUsage();
    if (!canMakeRequest) {
      addBotMessage(
        "You've reached your daily limit. Please wait for the reset or upgrade your plan.",
      );
      state.setIsLoading(false);
      return;
    }

    let currentChatId = state.chatId;
    try {
      if (!currentChatId) {
        currentChatId =
          (await chatSidePanelRef.current?.createChat(
            state.input,
            DEFAULT_MODEL,
            "PMP",
          )) || null;
        state.setChatId(currentChatId);
      }

      addUserMessage(state.input);
      await sendToSidePanel("user", state.input);

      if (phase === "init") {
        await startQuestionFlow(state.input, currentChatId);
      }
    } catch (error) {
      onError?.(error, "sending message");
      addBotMessage(
        "I encountered a problem processing your message. Please try again.",
      );
    } finally {
      state.setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    state.setIsLoading(false);
  };

  return {
    mode: "pmp" as const,
    ...state,
    phase,
    setPhase,
    questionsData,
    currentQuestionIndex,
    customAnswer,
    setCustomAnswer,
    provider,
    chatSidePanelRef,
    messagesEndRef,
    handleSend,
    stopGeneration,
    handleAnswerSubmit,
    handleModelSelect: withLoadingAndErrorHandling(
      handleModelSelect,
      "I encountered a problem generating the response. Please try a different model.",
      "selecting model",
    ),
    resetSession,
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
