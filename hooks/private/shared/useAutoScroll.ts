import { useEffect, useRef } from "react";

export function useAutoScroll(messages: any[], delay: number = 100) {
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
