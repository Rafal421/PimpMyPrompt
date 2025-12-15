"use client";
import { useRef, useState } from "react";
import type { User } from "@/lib/types";
import { useChatState } from "@/hooks/private/chat/useChatState";
import { useChatMessages } from "@/hooks/private/chat/useChatMessages";
import { useAutoScroll } from "@/hooks/private/chat/useAutoScroll";
import { useUsageLimit } from "@/hooks/private/chat/useUsageLimit";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

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

  // Compare handler - TODO: implement
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

    // TODO: Implement comparison logic
    // 1. Create/get chat ID
    // 2. Send to multiple models
    // 3. Display results in comparison view

    console.log("Compare mode - not yet implemented");
    messageHelpers.addBotMessage(
      state.setMessages,
      "Compare mode is coming soon! This will allow you to compare responses from multiple AI models."
    );
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
    resetSession,

    // Usage limits
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  };
}
