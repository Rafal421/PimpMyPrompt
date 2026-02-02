"use client";
import type { Message } from "@/lib/shared/types";

export function useChatMessages() {
  const addMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
    from: "user" | "bot",
    isTyping: boolean = false,
  ) => {
    setMessages((prev) => [...prev, { from, text, isTyping }]);
  };

  const addUserMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
  ) => {
    addMessage(setMessages, text, "user", false);
  };

  const addBotMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
    isTyping: boolean = false,
  ) => {
    addMessage(setMessages, text, "bot", isTyping);
  };

  const updateLastMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
  ) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        text,
      };
      return updated;
    });
  };

  const removeLastMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  ) => {
    setMessages((prev) => prev.slice(0, -1));
  };

  return {
    addMessage,
    addUserMessage,
    addBotMessage,
    updateLastMessage,
    removeLastMessage,
  };
}
