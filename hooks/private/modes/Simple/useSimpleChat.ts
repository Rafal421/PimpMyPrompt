"use client";
import { useRef, useState } from "react";
import type { User } from "@/lib/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";

const DEFAULT_MODEL = "gpt-4o-mini";

export interface SimpleChatConfig {
  user: User;
  welcomeMessage?: string;
  onError?: (error: any, context?: string) => void;
}

/**
 * Hook dla prostego czatu bez PMP flow
 * Prosty question-answer bez dodatkowych kroków
 */
export function useSimpleChat({
  user,
  welcomeMessage = "Hi! How can I help you today?",
  onError,
}: SimpleChatConfig) {
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

  // Simple send handler
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
          "CHAT"
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
      // Send to simple chat endpoint
      const response = await fetch(`/api/modes/simple`, {
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

      if (data.success && data.response) {
        messageHelpers.addBotMessage(state.setMessages, data.response, true);
        await incrementUsage();
      } else {
        throw new Error("Invalid response from AI");
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

  const stopGeneration = () => {
    state.setIsLoading(false);
    // Note: We could add AbortController here for API requests if needed
  };

  return {
    // Mode identifier
    mode: "simple" as const,

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
