"use client";
import { useRef, useState } from "react";
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

  // Core state
  const state = useChatState(welcomeMessage);
  const messageHelpers = useChatMessages();

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

  // Reset session
  const resetSession = () => {
    state.reset(welcomeMessage);
    setCompareSessionId(null);
  };

  // Compare handler
  const handleSend = async () => {
    if (!state.input.trim() || state.isLoading) return;

    state.setIsLoading(true);

    // Check usage limit
    await checkUsage();
    if (!canMakeRequest) {
      messageHelpers.addBotMessage(
        state.setMessages,
        "You've reached your daily limit. Please wait for the reset or upgrade your plan."
      );
      state.setIsLoading(false);
      return;
    }

    // Create or get chat ID
    let currentChatId = state.chatId;
    try {
      if (!currentChatId) {
        currentChatId =
          (await chatSidePanelRef.current?.createChat(
            state.input,
            "compare",
            "COMPARE"
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
          userMessage
        );
      }

      // Show loading placeholders for all models
      const loadingResponses = COMPARE_MODELS.map((model) => ({
        modelId: model.id,
        model: model.name,
        provider: model.provider,
        response: "Loading...",
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      if (data.success && data.responses) {
        if (data.session_id && !compareSessionId) {
          setCompareSessionId(data.session_id);
        }

        state.setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.from === "bot") {
            lastMessage.compareResponses = data.responses;
            lastMessage.summary = data.summary;
          }
          return newMessages;
        });

        if (currentChatId) {
          await chatSidePanelRef.current?.sendMessage(
            currentChatId,
            "bot",
            `Compared ${data.responses.length} AI models: ${data.responses
              .map((r: CompareResponse) => r.model)
              .join(", ")}${
              data.summary
                ? `\n\nSummary: ${data.summary.slice(0, 100)}...`
                : ""
            }`
          );
        }

        await incrementUsage();
      } else {
        throw new Error("Invalid response from comparison service");
      }
    } catch (error) {
      onError?.(error, "comparing models");
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
        `I encountered a problem comparing responses: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please try again.`
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
    mode: "compare" as const,

    // Core state
    ...state,

    // Compare-specific state
    compareSessionId,
    setCompareSessionId,

    // Refs
    chatSidePanelRef,
    messagesEndRef,

    // Actions
    handleSend,
    stopGeneration,
    resetSession,

    // Usage limits
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
