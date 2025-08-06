// hooks/private/mainPanel/useChat.ts
"use client";
import { useState, useRef } from "react";
import type { Provider, Phase, Message, QuestionData, User } from "@/lib/types";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";
import { getQuestionProviderById } from "@/lib/ai-config";
import { addRegularMessage } from "@/lib/messageHelpers";

import { createQuestionFlow } from "./useQuestionFlow";
import { createPromptImprover } from "./usePromptImprover";
import { createModelSelection } from "./useModelSelection";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export const useChat = ({
  user,
  onError,
}: {
  user: User;
  onError?: (error: any, context?: string) => void;
}) => {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

  // Core state
  const [messages, setMessages] = useState<Message[]>([
    {
      from: "bot",
      text: "Ask a question and I'll help you refine it!",
      isTyping: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [phase, setPhase] = useState<Phase>("init");

  // Question flow state
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [customAnswer, setCustomAnswer] = useState("");
  const messagesEndRef = useAutoScroll(messages, 500);

  // Create logic handlers by passing state and setters
  const { generateImprovedPrompt } = createPromptImprover({
    originalQuestion,
    clarifyingAnswers,
    provider,
    chatId,
    chatSidePanelRef,
    setMessages,
    setPhase,
    setImprovedPrompt,
    setIsBotResponding,
    onError,
  });

  const { startQuestionFlow, handleAnswerSubmit } = createQuestionFlow({
    provider,
    chatId,
    chatSidePanelRef,
    setMessages,
    setPhase,
    generateImprovedPrompt,
    setOriginalQuestion,
    setInput,
    setQuestionsData,
    setCurrentQuestionIndex,
    setClarifyingAnswers,
    setCustomAnswer,
    clarifyingAnswers,
    questionsData,
    currentQuestionIndex,
    onError,
  });

  const { handleModelSelect } = createModelSelection({
    improvedPrompt,
    chatId,
    chatSidePanelRef,
    setMessages,
    setPhase,
    onError,
  });

  // Reset session
  const resetSession = () => {
    setMessages([
      { from: "bot", text: "Ask a question and I'll help you refine it!" },
    ]);
    setInput("");
    setPhase("init");
    setOriginalQuestion("");
    setImprovedPrompt("");
    setClarifyingAnswers([]);
    setCurrentQuestionIndex(0);
    setQuestionsData([]);
    setCustomAnswer("");
    setChatId(null);
  };

  // Main message handling
  const handleSend = async () => {
    if (!input.trim() || isBotResponding) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const questionProvider = getQuestionProviderById(provider);
      const currentModel = questionProvider?.model || DEFAULT_MODEL;
      currentChatId =
        (await chatSidePanelRef.current?.createChat(input, currentModel)) ||
        null;
      setChatId(currentChatId);
    }

    setIsBotResponding(true);
    addRegularMessage(setMessages, input, "user");
    if (currentChatId) {
      await chatSidePanelRef.current?.sendMessage(currentChatId, "user", input);
    }

    try {
      if (phase === "init") {
        await startQuestionFlow(input, currentChatId);
      }
    } catch (error) {
      onError?.(error, "sending message");

      // Add error message to chat so user knows what happened
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem processing your message. Please try again or rephrase your question.",
        },
      ]);
    }
    setIsBotResponding(false);
  };

  const wrappedHandleAnswerSubmit = async (answer: string) => {
    if (isBotResponding) return;
    // Handle answer submission
    try {
      await handleAnswerSubmit(answer);
    } catch (error) {
      onError?.(error, "submitting answer");

      // Error message for answer submission
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem processing your answer. Please try again or select a different option.",
        },
      ]);
      setIsBotResponding(false);
    }
  };

  const wrappedHandleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (isBotResponding) return;
    setIsBotResponding(true);
    try {
      await handleModelSelect(selectedProvider, selectedModel);
    } catch (error) {
      onError?.(error, "selecting model");

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem generating the response with the selected model. Please try a different model or try again.",
        },
      ]);
    }
    setIsBotResponding(false);
  };

  return {
    chatSidePanelRef,
    messages,
    setMessages,
    input,
    setInput,
    isBotResponding,
    chatId,
    setChatId,
    provider,
    setProvider,
    phase,
    setPhase,
    questionsData,
    currentQuestionIndex,
    customAnswer,
    setCustomAnswer,
    messagesEndRef,
    resetSession,
    handleSend,
    handleAnswerSubmit: wrappedHandleAnswerSubmit,
    handleModelSelect: wrappedHandleModelSelect,
  };
};
