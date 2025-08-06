// Helper functions for managing message animations and sequencing

import type { Message } from "@/lib/types";

export const addTypingMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  text: string,
  onComplete?: () => void
): void => {
  setMessages((prev) => [...prev, { from: "bot", text, isTyping: true }]);

  // After typing animation completes, mark as not typing
  if (onComplete) {
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 && msg.isTyping
            ? { ...msg, isTyping: false }
            : msg
        )
      );
      onComplete();
    }, text.length * 20 + 500); // Estimate typing time plus buffer
  }
};

export const addRegularMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  text: string,
  from: "user" | "bot" = "bot"
): void => {
  setMessages((prev) => [...prev, { from, text, isTyping: false }]);
};

export const updateLastMessage = (
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  text: string
): void => {
  setMessages((prev) =>
    prev.map((msg, index) =>
      index === prev.length - 1 ? { ...msg, text } : msg
    )
  );
};
