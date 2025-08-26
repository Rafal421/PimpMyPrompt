"use client";

import MarkdownTypewriter from "@/components/ui/MarkdownTypewriter";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

interface Message {
  from: "user" | "bot";
  text: string;
  isTyping?: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isBotResponding: boolean;
}

export default function ChatMessages({
  messages,
  isBotResponding,
}: ChatMessagesProps) {
  return (
    <div className="w-full px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
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
                    speed={20}
                    className="leading-relaxed whitespace-pre-wrap font-medium text-sm sm:text-base"
                  />
                ) : msg.from === "bot" ? (
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h1: ({ ...props }) => (
                        <h1
                          className="text-xl font-bold mt-4 mb-2"
                          {...props}
                        />
                      ),
                      h2: ({ ...props }) => (
                        <h2
                          className="text-lg font-bold mt-3 mb-2"
                          {...props}
                        />
                      ),
                      h3: ({ ...props }) => (
                        <h3
                          className="text-md font-bold mt-3 mb-1"
                          {...props}
                        />
                      ),
                      h4: ({ ...props }) => (
                        <h4
                          className="text-base font-bold mt-2 mb-1"
                          {...props}
                        />
                      ),
                      p: ({ ...props }) => <p className="mb-2" {...props} />,
                      ul: ({ ...props }) => (
                        <ul className="list-disc pl-6 mb-2" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="list-decimal pl-6 mb-2" {...props} />
                      ),
                      li: ({ ...props }) => <li className="mb-1" {...props} />,
                      strong: ({ ...props }) => (
                        <strong className="font-bold" {...props} />
                      ),
                      em: ({ ...props }) => (
                        <em className="italic" {...props} />
                      ),
                      code: ({ ...props }) => (
                        <code className="bg-gray-800 px-1 rounded" {...props} />
                      ),
                      pre: ({ ...props }) => (
                        <pre
                          className="bg-gray-800 p-2 rounded mb-3 overflow-x-auto"
                          {...props}
                        />
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
    </div>
  );
}
