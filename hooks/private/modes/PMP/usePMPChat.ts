"use client";
import { useState, useRef } from "react";
import type { Provider, Phase, QuestionData, User } from "@/lib/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import { DEFAULT_QUESTION_PROVIDER } from "@/lib/providers/ai-config";

// Import existing factories
import { createQuestionFlow } from "@/hooks/private/modes/PMP/questionFlowFactory";
import { createPromptImprover } from "@/hooks/private/modes/PMP/promptImproverFactory";
import { createModelSelection } from "@/hooks/private/modes/PMP/modelSelectionFactory";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export interface PMPChatConfig {
  user: User;
  onError?: (error: any, context?: string) => void;
}

/**
 * Hook dla trybu PMP (Prompt Improvement Flow)
 * Zawiera całą logikę question flow, prompt improvement i model selection
 */
export function usePMPChat({ user, onError }: PMPChatConfig) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

  // Podstawowy stan z core hooka
  const state = useChatState("Ask a question and I'll help you refine it!");
  const messageHelpers = useChatMessages();

  // PMP-specific state
  const [provider, setProvider] = useState<Provider>(DEFAULT_QUESTION_PROVIDER);
  const [phase, setPhase] = useState<Phase>("init");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [customAnswer, setCustomAnswer] = useState("");

  // Auto scroll
  const messagesEndRef = useAutoScroll(state.messages, 200);

  // Usage limit
  const {
    incrementUsage,
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  } = useUsageLimit();

  // Create logic handlers using factories
  const { generateImprovedPrompt } = createPromptImprover({
    originalQuestion,
    clarifyingAnswers,
    provider,
    chatId: state.chatId,
    chatSidePanelRef,
    setMessages: state.setMessages,
    setPhase,
    setImprovedPrompt,
    setIsBotResponding: state.setIsLoading,
    onError,
  });

  const { startQuestionFlow, handleAnswerSubmit } = createQuestionFlow({
    provider,
    chatId: state.chatId,
    chatSidePanelRef,
    setMessages: state.setMessages,
    phase,
    setPhase,
    generateImprovedPrompt,
    setOriginalQuestion,
    setInput: state.setInput,
    setQuestionsData,
    setCurrentQuestionIndex,
    setClarifyingAnswers,
    setCustomAnswer,
    clarifyingAnswers,
    questionsData,
    currentQuestionIndex,
    setIsBotResponding: state.setIsLoading,
    onError,
  });

  const { handleModelSelect } = createModelSelection({
    improvedPrompt,
    chatId: state.chatId,
    chatSidePanelRef,
    setMessages: state.setMessages,
    setPhase,
    onError,
    onUsageIncrement: incrementUsage,
  });

  // Reset session
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

  // Main message handling
  const handleSend = async () => {
    if (!state.input.trim() || state.isLoading) return;

    // Check usage limit
    await checkUsage();
    if (!canMakeRequest) {
      messageHelpers.addBotMessage(
        state.setMessages,
        "You've reached your daily limit. Please wait for the reset or upgrade your plan."
      );
      return;
    }

    // Create or get chat ID
    let currentChatId = state.chatId;
    if (!currentChatId) {
      currentChatId =
        (await chatSidePanelRef.current?.createChat(
          state.input,
          DEFAULT_MODEL,
          "PMP"
        )) || null;
      state.setChatId(currentChatId);
    }

    state.setIsLoading(true);
    messageHelpers.addUserMessage(state.setMessages, state.input);

    if (currentChatId) {
      await chatSidePanelRef.current?.sendMessage(
        currentChatId,
        "user",
        state.input
      );
    }

    try {
      if (phase === "init") {
        await startQuestionFlow(state.input, currentChatId);
      }
    } catch (error) {
      onError?.(error, "sending message");
      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem processing your message. Please try again."
      );
    } finally {
      state.setIsLoading(false);
    }
  };

  // Wrapped handlers with error handling
  const wrappedHandleAnswerSubmit = async (answer: string) => {
    if (state.isLoading) return;
    state.setIsLoading(true);
    try {
      await handleAnswerSubmit(answer);
    } catch (error) {
      onError?.(error, "submitting answer");
      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem processing your answer. Please try again."
      );
      state.setIsLoading(false);
    }
  };

  const wrappedHandleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (state.isLoading) return;
    state.setIsLoading(true);
    try {
      await handleModelSelect(selectedProvider, selectedModel);
    } catch (error) {
      onError?.(error, "selecting model");
      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem generating the response. Please try a different model."
      );
    } finally {
      state.setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    state.setIsLoading(false);
    // Note: We could add AbortController here for API requests if needed
  };

  return {
    // Mode identifier
    mode: "pmp" as const,

    // Core state
    ...state,

    // PMP-specific state
    phase,
    setPhase,
    questionsData,
    currentQuestionIndex,
    customAnswer,
    setCustomAnswer,
    provider,

    // Refs
    chatSidePanelRef,
    messagesEndRef,

    // Actions
    handleSend,
    stopGeneration,
    handleAnswerSubmit: wrappedHandleAnswerSubmit,
    handleModelSelect: wrappedHandleModelSelect,
    resetSession,

    // Usage limits
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
