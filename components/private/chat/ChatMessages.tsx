"use client";
import { motion, AnimatePresence } from "framer-motion";
import MarkdownTypewriter from "@/components/ui/MarkdownTypewriter";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { CompareResponses } from "@/components/private/modes/Compare/CompareResponses";
import type { Message } from "@/lib/types";

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  renderExtras?: () => React.ReactNode;
  chatId?: string | null;
}

/**
 * ChatMessages - Pure presentational component for chat messages
 * Renders message list with loading indicator and optional extras
 */
export default function ChatMessages({
  messages,
  isLoading,
  renderExtras,
  chatId,
}: ChatMessagesProps) {
  return (
    <div className="w-full h-full px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {/* Messages */}
      {messages.map((msg, idx) => {
        const isCompare = msg.from === "bot" && msg.compareResponses;

        return (
          <div
            key={idx}
            className={`flex gap-2 sm:gap-4 ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                isCompare ? "w-full" : "max-w-[85%] sm:max-w-2xl"
              } ${msg.from === "user" ? "order-first" : ""}`}
            >
              <div
                className={`${
                  isCompare
                    ? ""
                    : "px-3 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg"
                } ${
                  msg.from === "user"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto px-3 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg"
                    : isCompare
                    ? ""
                    : "bg-black/40 backdrop-blur-sm border border-gray-800/50 text-gray-100"
                }`}
              >
                <div className="leading-relaxed font-medium text-sm sm:text-base prose prose-invert max-w-none">
                  {msg.from === "bot" && msg.compareResponses ? (
                    <CompareResponses
                      responses={msg.compareResponses}
                      isLoading={isLoading && idx === messages.length - 1}
                      messageIndex={idx}
                      chatId={chatId}
                      summary={msg.summary}
                    />
                  ) : msg.from === "bot" && msg.isTyping ? (
                    <MarkdownTypewriter
                      text={msg.text}
                      speed={15}
                      className="leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base"
                    />
                  ) : msg.from === "bot" ? (
                    <MarkdownRenderer content={msg.text} />
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Loading indicator - only show if not in compare mode */}
      {isLoading &&
        messages.length > 0 &&
        !messages[messages.length - 1]?.compareResponses && (
          <div className="flex gap-2 sm:gap-4 justify-start">
            <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl px-3 py-3 sm:px-6 sm:py-4 shadow-lg">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}

      {/* Extra content (QuestionBlock, ModelSelection, etc) */}
      {renderExtras?.()}
    </div>
  );
}
