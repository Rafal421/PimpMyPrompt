"use client";
import { Send, Plus, Square } from "lucide-react";
import SimpleProviderSelector from "@/components/private/modes/Simple/SimpleProviderSelector";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  onReset: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  showResetButton?: boolean;
  requestsRemaining?: number;
  getTimeUntilReset?: () => string | null;
  onFocus?: () => void;
  showProviderSelector?: boolean;
  selectedProvider?: string;
  onProviderChange?: (provider: string, model: string) => void;
  selectedModel?: string;
}

/**
 * ChatInput - Pure presentational input component
 * Handles user input with callbacks, no business logic
 */
export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  onReset,
  disabled = false,
  isLoading = false,
  placeholder = "Type your message...",
  showResetButton = false,
  requestsRemaining,
  getTimeUntilReset,
  onFocus,
  showProviderSelector = false,
  selectedProvider,
  onProviderChange,
  selectedModel,
}: ChatInputProps) {
  /** handleKeyDown - Sends message on Enter key press */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 py-2 sm:py-6 pt-0 sm:pt-0">
      <div className="flex gap-2 sm:gap-4 items-end">
        <div className="flex-1 relative">
          {/* Status Bar Indicators */}
          <div className="absolute -top-12 sm:-top-14 left-0 right-0 flex items-center justify-center z-20 pointer-events-none px-2">
            {/* Usage warning pill - Perfectly Centered */}
            {typeof requestsRemaining !== "undefined" && (
              <div className="pointer-events-none px-3 py-1.5 rounded-2xl shadow-lg bg-gradient-to-r from-blue-600/60 to-purple-600/60 text-white text-[10px] sm:text-xs font-medium text-center min-w-[90px] opacity-80 flex items-center justify-center">
                {requestsRemaining > 0 ? (
                  `${requestsRemaining} requests left`
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="whitespace-nowrap">Limit reached</span>
                    {getTimeUntilReset?.() && (
                      <span className="text-[9px] text-white/80">
                        {getTimeUntilReset()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Provider selector - Right side */}
            {showProviderSelector &&
              selectedProvider &&
              onProviderChange &&
              selectedModel && (
                <div className="absolute right-0 pointer-events-auto">
                  <SimpleProviderSelector
                    selectedProvider={selectedProvider}
                    selectedModel={selectedModel}
                    onProviderChange={onProviderChange}
                    disabled={isLoading}
                  />
                </div>
              )}
          </div>

          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            rows={1}
            className="w-full px-4 py-3 pr-24 sm:px-8 sm:py-6 sm:pr-40 bg-transparent border border-gray-700/30 rounded-xl sm:rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-white placeholder-gray-400 hover:border-gray-600/40 transition-all duration-200 text-sm sm:text-base font-medium resize-none overflow-auto disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={placeholder}
            disabled={disabled}
          />

          {showResetButton ? (
            <button
              onClick={onReset}
              disabled={disabled}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 sm:px-4 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 touch-manipulation"
              title="New session"
            >
              <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span>New</span>
            </button>
          ) : isLoading ? (
            <button
              onClick={onStop}
              disabled={!onStop}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 sm:px-4 sm:py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 touch-manipulation"
              title="Stop generating"
            >
              <Square className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={disabled || !value.trim()}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 px-2.5 py-1.5 sm:px-4 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 touch-manipulation"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              <span>Send</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
