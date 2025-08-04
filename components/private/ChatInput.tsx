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
    <div className="bg-black/40 backdrop-blur-md border-t border-gray-800/50 p-3 sm:p-6">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex gap-2 sm:gap-4 items-end">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 pr-12 sm:px-6 sm:py-4 sm:pr-14 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-700/50 transition-all duration-200 text-base sm:text-lg font-medium"
              placeholder={getPlaceholderText()}
              disabled={isInputDisabled}
            />
            {phase === "done" ? (
              <button
                onClick={onResetSession}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl font-semibold flex items-center gap-1 sm:gap-2 text-sm sm:text-base touch-target"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">New Session</span>
                <span className="sm:hidden">New</span>
              </button>
            ) : (
              <button
                onClick={onSend}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 p-2 sm:p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center"
                disabled={
                  isBotResponding ||
                  !input.trim() ||
                  phase === "clarifying" ||
                  phase === "improving" ||
                  phase === "final-response" ||
                  phase === "model-selection"
                }
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 sm:mt-4 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
