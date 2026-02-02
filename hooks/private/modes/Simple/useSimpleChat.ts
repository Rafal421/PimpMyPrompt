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

export function useSimpleChat({
  user,
  welcomeMessage = "Hi! How can I help you today?",
  onError,
}: SimpleChatConfig) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);
  const [selectedProvider, setSelectedProvider] =
    useState<string>(DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);

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
  };

  const handleSend = async () => {
    if (!state.input.trim() || state.isLoading) return;

    const userMessage = state.input;
    messageHelpers.addUserMessage(state.setMessages, userMessage);
    state.setInput("");
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

    let currentChatId = state.chatId;
    try {
      const chatPromise = !currentChatId
        ? chatSidePanelRef.current?.createChat(
            userMessage,
            selectedModel,
            "CHAT",
          )
        : Promise.resolve(currentChatId);

      const history = state.messages.slice(-6).map((msg) => ({
        role: msg.from === "bot" ? ("assistant" as const) : ("user" as const),
        content: msg.text,
      }));

      const responsePromise = fetch(`/api/modes/simple`, {
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

      // Wait for chat creation and update state
      currentChatId = (await chatPromise) || null;
      if (currentChatId && !state.chatId) {
        state.setChatId(currentChatId);
      }

      if (currentChatId) {
        chatSidePanelRef.current?.sendMessage(
          currentChatId,
          "user",
          userMessage,
        );
      }

      const response = await responsePromise;

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
    mode: "simple" as const,

    ...state,

    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,

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
