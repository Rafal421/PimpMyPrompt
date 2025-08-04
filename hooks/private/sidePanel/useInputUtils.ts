import { useMemo } from "react";
import type { Phase } from "@/lib/types";

interface ChatInputState {
  isDisabled: boolean;
  placeholder: string;
  showResetButton: boolean;
  allowSubmit: boolean;
}

export function useChatInputUtils(
  phase: Phase,
  isBotResponding: boolean,
  inputValue: string = ""
): ChatInputState {
  return useMemo(() => {
    const isInputDisabled =
      isBotResponding ||
      phase === "done" ||
      phase === "clarifying" ||
      phase === "improving" ||
      phase === "final-response" ||
      phase === "model-selection";

    const getPlaceholderText = () => {
      switch (phase) {
        case "init":
          return "Ask AI a question...";
        case "clarifying":
          return "Answer the questions above...";
        case "improving":
          return "Improving your prompt...";
        case "model-selection":
          return "Choose a model above...";
        case "final-response":
          return "Getting your response...";
        case "done":
          return "Start a new session or browse history...";
        default:
          return "Type your message...";
      }
    };

    return {
      isDisabled: isInputDisabled,
      placeholder: getPlaceholderText(),
      showResetButton: phase === "done" || phase === "init",
      allowSubmit:
        phase === "init" && inputValue.trim().length > 0 && !isBotResponding,
    };
  }, [phase, isBotResponding, inputValue]);
}

// Validation utilities
export function validateChatInput(input: string, phase: Phase): boolean {
  if (!input || input.trim().length === 0) return false;
  if (phase !== "init") return false;
  if (input.length > 1000) return false; // Max length check
  return true;
}

export function formatChatTitle(title: string, model: string): string {
  return `${title} (${model})`;
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
