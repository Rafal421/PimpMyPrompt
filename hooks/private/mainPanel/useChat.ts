// hooks/private/mainPanel/useChat.ts
"use client";
import { useState, useRef } from "react";
import type { Provider, Phase, Message, QuestionData, User } from "@/lib/types";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";
import { getQuestionProviderById } from "@/lib/ai-config";

import { createQuestionFlow } from "./useQuestionFlow";
import { createPromptImprover } from "./usePromptImprover";
import { createModelSelection } from "./useModelSelection";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export const useChat = ({ user }: { user: User }) => {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

  // Core state
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Ask a question and I'll help you refine it!" },
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
  });

  const { handleModelSelect } = createModelSelection({
    improvedPrompt,
    chatId,
    chatSidePanelRef,
    setMessages,
    setPhase,
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
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    if (currentChatId) {
      await chatSidePanelRef.current?.sendMessage(currentChatId, "user", input);
    }

    try {
      if (phase === "init") {
        await startQuestionFlow(input, currentChatId);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "An error occurred. Please try again." },
      ]);
    }
    setIsBotResponding(false);
  };

  const wrappedHandleAnswerSubmit = async (answer: string) => {
    if (isBotResponding) return;
    setIsBotResponding(true);
    await handleAnswerSubmit(answer);
    setIsBotResponding(false);
  };

  const wrappedHandleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (isBotResponding) return;
    setIsBotResponding(true);
    await handleModelSelect(selectedProvider, selectedModel);
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