"use client";

import MarkdownTypewriter from "@/components/ui/MarkdownTypewriter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase, QuestionData, Provider } from "@/lib/types";
import QuestionBlock from "@/components/private/QuestionBlock";
import ModelSelection from "@/components/private/ModelSelection";

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
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ ...props }) => (
                        <h1
                          className="text-xl sm:text-2xl font-bold mt-6 mb-4 text-blue-300 border-b border-gray-700 pb-2"
                          {...props}
                        />
                      ),
                      h2: ({ ...props }) => (
                        <h2
                          className="text-lg sm:text-xl font-bold mt-5 mb-3 text-blue-300"
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="text-base sm:text-lg font-bold mt-4 mb-2 text-purple-300"
                          {...props}
                        />
                      ),
                      h4: ({ ...props }) => (
                        <h4
                          className="text-sm sm:text-base font-bold mt-3 mb-2 text-purple-300"
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => (
                        <p
                          className="mb-3 leading-relaxed text-gray-100"
                          {...props}
                        />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="list-disc pl-6 mb-4 space-y-1"
                          {...props}
                        />
                      ),
                      ol: ({ ...props }) => (
                        <ol
                          className="list-decimal pl-6 mb-4 space-y-1"
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => (
                        <li
                          className="mb-1 text-gray-100 leading-relaxed"
                          {...props}
                        />
                      ),
                      strong: ({ ...props }) => (
                        <strong className="font-bold text-white" {...props} />
                      ),
                      em: ({ ...props }) => (
                        <em className="italic text-gray-200" {...props} />
                      ),
                      code: ({ className, children, ...props }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code
                            className="bg-gray-800/60 text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700/50"
                            {...props}
                          >
                            {children}
                          </code>
                        ) : (
                          <code {...props}>{children}</code>
                        );
                      },
                      pre: ({ children, ...props }) => (
                        <pre
                          className="bg-gray-900/80 border border-gray-700/50 p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono shadow-lg"
                          {...props}
                        >
                          <div className="text-gray-300">{children}</div>
                        </pre>
                      ),
                      blockquote: ({ ...props }) => (
                        <blockquote
                          className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-gray-800/30 rounded-r-lg italic text-gray-200"
                          {...props}
                        />
                      ),
                      a: ({ ...props }) => (
                        <a
                          className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        />
                      ),
                      table: ({ ...props }) => (
                        <div className="overflow-x-auto mb-4">
                          <table
                            className="min-w-full border border-gray-700 rounded-lg"
                            {...props}
                          />
                        </div>
                      ),
                      thead: ({ ...props }) => (
                        <thead className="bg-gray-800/50" {...props} />
                      ),
                      tbody: ({ ...props }) => (
                        <tbody className="bg-gray-900/30" {...props} />
                      ),
                      th: ({ ...props }) => (
                        <th
                          className="px-4 py-2 text-left font-bold text-gray-200 border-b border-gray-700"
                          {...props}
                        />
                      ),
                      td: ({ ...props }) => (
                        <td
                          className="px-4 py-2 text-gray-300 border-b border-gray-700/50"
                          {...props}
                        />
                      ),
                      hr: ({ ...props }) => (
                        <hr className="my-6 border-gray-700" {...props} />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
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
