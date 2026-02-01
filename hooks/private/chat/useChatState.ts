"use client";
import { useState } from "react";
import type { Message } from "@/lib/shared/types";

export function useChatState(initialMessage?: string) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessage
      ? [{ from: "bot", text: initialMessage, isTyping: false }]
      : [],
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const reset = (welcomeMessage?: string) => {
    setMessages(
      welcomeMessage
        ? [{ from: "bot", text: welcomeMessage, isTyping: false }]
        : [],
    );
    setInput("");
    setIsLoading(false);
    setChatId(null);
  };

  return {
    messages,
    input,
    isLoading,
    chatId,
    setMessages,
    setInput,
    setIsLoading,
    setChatId,
    reset,
  };
}
