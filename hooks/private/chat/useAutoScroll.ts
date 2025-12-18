import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";

/**
 * useAutoScroll - Automatic scroll to bottom on new messages
 * Returns a ref to attach to the scroll target element
 */
export function useAutoScroll(messages: Message[], delay: number = 100) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /** scrollToBottom - Smoothly scrolls to the bottom of messages */
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(() => {
      scrollToBottom();
    }, delay);

    return () => clearTimeout(timer);
  }, [messages, delay]);

  return messagesEndRef;
}
