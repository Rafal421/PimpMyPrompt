"use client";

import { Send, Plus } from "lucide-react";
import type { Phase } from "@/lib/types";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  onSend: () => void;
  onResetSession: () => void;
  isBotResponding: boolean;
  phase: Phase;
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  onResetSession,
  isBotResponding,
  phase,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  const isInputDisabled =
    isBotResponding ||
    phase === "done" ||
    phase === "clarifying" ||
    phase === "improving" ||
    phase === "final-response" ||
    phase === "model-selection";

  const getPlaceholderText = () => {
    if (phase === "init") {
      return "Ask AI a question...";
    }
    return "New session or browse history...";
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pt-0 sm:pt-0">
      <div className="flex gap-2 sm:gap-4 items-end">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            className="w-full px-6 py-4 pr-16 sm:px-8 sm:py-6 sm:pr-20 bg-transparent border border-gray-700/30 rounded-2xl sm:rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-white placeholder-gray-400 hover:border-gray-600/40 transition-all duration-200 text-base sm:text-base font-medium resize-none overflow-auto"
            placeholder={getPlaceholderText()}
            disabled={isInputDisabled}
          />
          {phase === "done" ? (
            <button
              onClick={onResetSession}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl sm:rounded-2xl font-semibold flex items-center gap-2 text-base sm:text-lg touch-target"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">New Session</span>
              <span className="sm:hidden">New</span>
            </button>
          ) : (
            <button
              onClick={onSend}
              className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center"
              disabled={
                isBotResponding ||
                !input.trim() ||
                phase === "clarifying" ||
                phase === "improving" ||
                phase === "final-response" ||
                phase === "model-selection"
              }
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
