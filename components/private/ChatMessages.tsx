"use client";
import { Bot, UserIcon } from "lucide-react";

interface Message {
  from: "user" | "bot";
  text: string;
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-4 ${
            msg.from === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {msg.from === "bot" && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
          )}

          <div
            className={`max-w-2xl ${msg.from === "user" ? "order-first" : ""}`}
          >
            <div
              className={`px-6 py-4 rounded-2xl shadow-lg ${
                msg.from === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                  : "bg-black/40 backdrop-blur-sm border border-gray-800/50 text-gray-100"
              }`}
            >
              <p className="leading-relaxed whitespace-pre-wrap font-medium !m-0 !mt-0 !mb-0 !ml-0 !mr-0">
                {msg.text}
              </p>
            </div>
          </div>

          {msg.from === "user" && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      ))}

      {/* Loading indicator */}
      {isBotResponding && (
        <div className="flex gap-4 justify-start">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl px-6 py-4 shadow-lg">
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
