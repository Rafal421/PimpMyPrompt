import { useEffect, useRef } from "react";

export function useAutoScroll(messages: any[], delay: number = 1500) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [messages, delay]);

  return messagesEndRef;
}
