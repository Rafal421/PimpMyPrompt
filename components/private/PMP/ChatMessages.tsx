"use client";

import MarkdownTypewriter from "@/components/ui/MarkdownTypewriter";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase, QuestionData, Provider } from "@/lib/types";
import QuestionBlock from "@/components/private/PMP/QuestionBlock";
import ModelSelection from "@/components/private/PMP/ModelSelection";

interface Message {
  from: "user" | "bot";
  text: string;
  isTyping?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isBotResponding: boolean;
  phase?: Phase;
  questionsData?: QuestionData[];
  currentQuestionIndex?: number;
  customAnswer?: string;
  setCustomAnswer?: (value: string) => void;
  onAnswerSubmit?: (answer: string) => void;
  onModelSelect?: (provider: Provider, model: string) => void;
}

export default function ChatMessages({
  messages,
  isBotResponding,
  phase,
  questionsData,
  currentQuestionIndex,
  customAnswer,
  setCustomAnswer,
  onAnswerSubmit,
  onModelSelect,
}: ChatMessagesProps) {
  return (
    <div className="w-full h-full px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-2 sm:gap-4 ${
            msg.from === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] sm:max-w-2xl ${
              msg.from === "user" ? "order-first" : ""
            }`}
          >
            <div
              className={`px-3 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg ${
                msg.from === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                  : "bg-black/40 backdrop-blur-sm border border-gray-800/50 text-gray-100"
              }`}
            >
              <div className="leading-relaxed font-medium text-sm sm:text-base prose prose-invert max-w-none">
                {msg.from === "bot" && msg.isTyping ? (
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
      ))}

      {/* Loading indicator */}
      {isBotResponding && (
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

      {/* Question Block - rendered as part of messages */}
      <AnimatePresence mode="wait">
        {phase === "clarifying" &&
          questionsData?.[currentQuestionIndex || 0] && (
            <motion.div
              key="question-block"
              initial={{ opacity: 0, height: 0, marginTop: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginTop: 16,
                scale: 1,
                transition: {
                  height: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
                  opacity: { duration: 0.2, delay: 0.1, ease: "easeOut" },
                  marginTop: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1] },
                  scale: { duration: 0.3, delay: 0.1, ease: "easeOut" },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
                scale: 0.95,
                transition: {
                  opacity: { duration: 0.4, ease: "easeIn" },
                  scale: { duration: 0.5, ease: "easeIn" },
                  height: {
                    duration: 0.6,
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: 0.2,
                  },
                  marginTop: {
                    duration: 0.6,
                    ease: [0.4, 0.0, 0.2, 1],
                    delay: 0.2,
                  },
                },
              }}
              className="w-full overflow-hidden"
            >
              <QuestionBlock
                currentQuestionOptions={
                  questionsData[currentQuestionIndex || 0].options
                }
                customAnswer={customAnswer || ""}
                setCustomAnswer={setCustomAnswer || (() => {})}
                onAnswerSubmit={onAnswerSubmit || (() => {})}
                isBotResponding={isBotResponding}
              />
            </motion.div>
          )}
      </AnimatePresence>

      {/* Model Selection - rendered as part of messages */}
      <AnimatePresence mode="wait">
        {phase === "model-selection" && (
          <motion.div
            key="model-selection"
            initial={{ opacity: 0, height: 0, marginTop: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              height: "auto",
              marginTop: 16,
              scale: 1,
              transition: {
                height: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
                opacity: { duration: 0.3, delay: 0.1, ease: "easeOut" },
                marginTop: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] },
                scale: { duration: 0.3, delay: 0.1, ease: "easeOut" },
              },
            }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              scale: 0.95,
              transition: {
                opacity: { duration: 0.4, ease: "easeIn" },
                scale: { duration: 0.5, ease: "easeIn" },
                height: { duration: 0.6, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 },
                marginTop: {
                  duration: 0.6,
                  ease: [0.4, 0.0, 0.2, 1],
                  delay: 0.2,
                },
              },
            }}
            className="flex justify-center overflow-hidden"
          >
            <ModelSelection
              onModelSelect={onModelSelect || (() => {})}
              isBotResponding={isBotResponding}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
