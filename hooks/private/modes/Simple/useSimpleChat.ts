"use client";
import { useRef, useState } from "react";
import type { User } from "@/lib/shared/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import { PROVIDERS } from "@/lib/providers/ai-config";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_PROVIDER = "openai";

export interface SimpleChatConfig {
  user: User;
  welcomeMessage?: string;
  onError?: (error: unknown, context?: string) => void;
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
  const [selectedProvider, setSelectedProvider] =
    useState<string>(DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

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
            selectedModel,
            "CHAT"
          )) || null;
        state.setChatId(currentChatId);
      }

      const userMessage = state.input;

      const history = state.messages.slice(-6).map((msg) => ({
        role: msg.from === "bot" ? ("assistant" as const) : ("user" as const),
        content: msg.text,
      }));

      messageHelpers.addUserMessage(state.setMessages, userMessage);
      state.setInput("");

      if (currentChatId) {
        await chatSidePanelRef.current?.sendMessage(
          currentChatId,
          "user",
          userMessage
        );
      }

      // Send to simple chat endpoint with selected provider
      const response = await fetch(`/api/modes/simple`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          chat_id: currentChatId,
          history,
          provider: selectedProvider,
          model: selectedModel,
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

    // Provider selection
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,

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
