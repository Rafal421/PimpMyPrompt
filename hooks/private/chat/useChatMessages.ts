"use client";
import type { Message } from "@/lib/types";

/**
 * useChatMessages - Message manipulation utilities
 * Provides helper functions for adding, updating, and removing messages
 */
export function useChatMessages() {
  /** addMessage - Adds a new message to the chat */
  const addMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
    from: "user" | "bot",
    isTyping: boolean = false
  ) => {
    setMessages((prev) => [...prev, { from, text, isTyping }]);
  };

  /** addUserMessage - Adds a user message */
  const addUserMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string
  ) => {
    addMessage(setMessages, text, "user", false);
  };

  /** addBotMessage - Adds a bot message with optional typing animation */
  const addBotMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string,
    isTyping: boolean = false
  ) => {
    addMessage(setMessages, text, "bot", isTyping);
  };

  /** updateLastMessage - Updates the text of the last message in the list */
  const updateLastMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    text: string
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

  /** removeLastMessage - Removes the last message from the list */
  const removeLastMessage = (
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
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
