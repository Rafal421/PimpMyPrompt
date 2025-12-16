"use client";
import { useRef, useState } from "react";
import type { User } from "@/lib/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import { COMPARE_MODELS } from "@/lib/compare-config";

export interface CompareChatConfig {
  user: User;
  welcomeMessage?: string;
  onError?: (error: any, context?: string) => void;
}

export function useCompareChat({
  user,
  welcomeMessage = "Compare responses from different AI models!",
  onError,
}: CompareChatConfig) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

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
  };

  // Compare handler
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
          "compare", // Special model identifier for compare mode
          "COMPARE"
        )) || null;
      state.setChatId(currentChatId);
    }

    state.setIsLoading(true);
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

    try {
      if (!currentChatId) {
        throw new Error("Chat ID not available");
      }

      // Show loading placeholders for all models
      const loadingResponses = COMPARE_MODELS.map((model) => ({
        modelId: model.id,
        model: model.name,
        response: "",
        success: true,
      }));

      state.setMessages((prev) => [
        ...prev,
        {
          from: "bot" as const,
          text: "",
          compareResponses: loadingResponses,
        },
      ]);

      const response = await fetch("/api/chat/compare", {
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
        // Update with actual responses
        state.setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.from === "bot") {
            lastMessage.compareResponses = data.responses;
          }
          return newMessages;
        });

        await incrementUsage();
      } else {
        throw new Error("Invalid response from comparison service");
      }
    } catch (error) {
      onError?.(error, "comparing models");
      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem comparing responses. Please try again."
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
