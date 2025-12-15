"use client";
import { useRef, useState } from "react";
import type { User } from "@/lib/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

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

  // Dummy states to match PMP hook structure (for React Hooks consistency)
  const [_unused1] = useState(null);
  const [_unused2] = useState(null);
  const [_unused3] = useState("");
  const [_unused4] = useState("");
  const [_unused5] = useState<string[]>([]);
  const [_unused6] = useState(0);
  const [_unused7] = useState([]);
  const [_unused8] = useState("");

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
          DEFAULT_MODEL
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
      // Simple API call - adjust endpoint as needed
      const response = await fetch(`/api/chat/simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chatId: currentChatId,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      messageHelpers.addBotMessage(state.setMessages, data.message, true);

      // Increment usage after successful response
      await incrementUsage();

      // Save to DB
      if (currentChatId) {
        await chatSidePanelRef.current?.sendMessage(
          currentChatId,
          "bot",
          data.message
        );
      }
    } catch (error) {
      onError?.(error, "sending message");
      messageHelpers.addBotMessage(
        state.setMessages,
        "I encountered a problem processing your message. Please try again."
      );
    }

    state.setIsLoading(false);
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
    resetSession,

    // Usage limits
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
