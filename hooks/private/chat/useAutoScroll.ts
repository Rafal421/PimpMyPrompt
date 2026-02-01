import { useEffect, useRef } from "react";
import type { Message } from "@/lib/shared/types";

export function useAutoScroll(messages: Message[], delay: number = 100) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
