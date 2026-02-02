"use client";
import { useRef, useState, useCallback } from "react";
import type { User, CompareResponse } from "@/lib/shared/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import { COMPARE_MODELS } from "@/lib/chat/compare-config";

export interface CompareChatConfig {
  user: User;
  welcomeMessage?: string;
  onError?: (error: unknown, context?: string) => void;
}

export interface CompareSession {
  id: string;
  title: string;
  created_at: string;
}

export function useCompareChat({
  user,
  welcomeMessage = "Compare responses from different AI models!",
  onError,
}: CompareChatConfig) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);
  const [compareSessionId, setCompareSessionId] = useState<string | null>(null);

  const [selectedModels, setSelectedModels] = useState<string[]>(() =>
    COMPARE_MODELS.map((m) => m.id),
  );
  const toggleModel = useCallback((modelId: string) => {
    setSelectedModels((prev) => {
      if (prev.includes(modelId)) {
        return prev.filter((id) => id !== modelId);
      }
      return [...prev, modelId];
    });
  }, []);

  const state = useChatState(welcomeMessage);
  const messageHelpers = useChatMessages();

  const messagesEndRef = useAutoScroll(state.messages, 200);

  const {
    incrementUsage,
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  } = useUsageLimit();

  const resetSession = () => {
    state.reset(welcomeMessage);
    setCompareSessionId(null);
  };

  const handleSend = async () => {
    if (!state.input.trim() || state.isLoading) return;

    if (selectedModels.length === 0) {
      messageHelpers.addBotMessage(
        state.setMessages,
        "Please select at least one AI model to compare.",
      );
      return;
    }

    state.setIsLoading(true);

    await checkUsage();
    if (!canMakeRequest) {
      messageHelpers.addBotMessage(
        state.setMessages,
        "You've reached your daily limit. Please wait for the reset or upgrade your plan.",
      );
      state.setIsLoading(false);
      return;
    }

    const modelsToCompare = COMPARE_MODELS.filter((m) =>
      selectedModels.includes(m.id),
    );

    let currentChatId = state.chatId;
    try {
      if (!currentChatId) {
        currentChatId =
          (await chatSidePanelRef.current?.createChat(
            state.input,
            "compare",
            "COMPARE",
          )) || null;
        state.setChatId(currentChatId);
      }

      const userMessage = state.input;
      messageHelpers.addUserMessage(state.setMessages, userMessage);
      state.setInput("");

      if (currentChatId) {
        await chatSidePanelRef.current?.sendMessage(
          currentChatId,
          "user",
          userMessage,
        );
      }

      const loadingResponses = modelsToCompare.map((model) => ({
        modelId: model.id,
        model: model.name,
        provider: model.provider,
        response: "",
        success: true,
        isLoading: true,
      }));

      state.setMessages((prev) => [
        ...prev,
        {
          from: "bot" as const,
          text: "",
          compareResponses: loadingResponses,
        },
      ]);

      const response = await fetch("/api/modes/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chat_id: currentChatId,
          selectedModels: selectedModels,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";
      let finalSummary = "";
      let sessionId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "response") {
                state.setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (
                    lastMessage &&
                    lastMessage.from === "bot" &&
                    lastMessage.compareResponses
                  ) {
                    const updatedResponses = lastMessage.compareResponses.map(
                      (r) =>
                        r.modelId === data.response.modelId
                          ? { ...data.response, isLoading: false }
                          : r,
                    );
                    lastMessage.compareResponses = updatedResponses;
                  }
                  return newMessages;
                });
              } else if (data.type === "generating_summary") {
                state.setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.from === "bot") {
                    lastMessage.summaryLoading = true;
                  }
                  return newMessages;
                });
              } else if (data.type === "complete") {
                finalSummary = data.summary || "";
                sessionId = data.session_id;

                state.setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage && lastMessage.from === "bot") {
                    lastMessage.summary = finalSummary;
                    lastMessage.summaryLoading = false;
                  }
                  return newMessages;
                });

                if (sessionId && !compareSessionId) {
                  setCompareSessionId(sessionId);
                }
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
              state.setMessages((prev) => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (
                  lastMessage?.from === "bot" &&
                  lastMessage.compareResponses
                ) {
                  lastMessage.compareResponses =
                    lastMessage.compareResponses.map((r) =>
                      r.isLoading
                        ? {
                            ...r,
                            isLoading: false,
                            success: false,
                            response: "Failed to parse response",
                          }
                        : r,
                    );
                }
                return newMessages;
              });
            }
          }
        }
      }

      if (currentChatId) {
        await chatSidePanelRef.current?.sendMessage(
          currentChatId,
          "bot",
          `Compared ${modelsToCompare.length} AI models${
            finalSummary ? `\n\nSummary: ${finalSummary.slice(0, 100)}...` : ""
          }`,
        );
      }

      await incrementUsage();
    } catch (error) {
      onError?.(error, "sending compare message");
      console.error("Compare error:", error);

      state.setMessages((prev) => {
        const newMessages = [...prev];
        if (
          newMessages.length > 0 &&
          newMessages[newMessages.length - 1].from === "bot"
        ) {
          newMessages.pop();
        }
        return newMessages;
      });

      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem comparing responses. Please try again.",
      );
    } finally {
      state.setIsLoading(false);
    }
  };

  const stopGeneration = () => {
    state.setIsLoading(false);
  };

  return {
    mode: "compare" as const,
    ...state,
    compareSessionId,
    setCompareSessionId,
    selectedModels,
    toggleModel,
    chatSidePanelRef,
    messagesEndRef,
    handleSend,
    stopGeneration,
    resetSession,
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
