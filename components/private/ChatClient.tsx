"use client";
import { useState } from "react";
import type { User } from "@/lib/types";
import ChatSidePanel from "@/components/private/ChatSidePanel";
import QuestionBlock from "@/components/private/QuestionBlock";
import ChatMessages from "@/components/private/ChatMessages";
import ProviderSelector from "@/components/private/ProviderSelector";
import ModelSelection from "@/components/private/ModelSelection";
import ChatInput from "@/components/private/ChatInput";
import { Background } from "@/components/ui/background";
import { useChat } from "@/hooks/private/mainPanel/useChat";
import { Menu, X } from "lucide-react";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export default function ChatClient({ user }: { user: User }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const {
    chatSidePanelRef,
    messages,
    setMessages,
    input,
    setInput,
    isBotResponding,
    chatId,
    setChatId,
    provider,
    setProvider,
    phase,
    setPhase,
    questionsData,
    currentQuestionIndex,
    customAnswer,
    setCustomAnswer,
    messagesEndRef,
    resetSession,
    handleSend,
    handleAnswerSubmit,
    handleModelSelect,
  } = useChat({ user });

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <Background />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-10
        transform transition-transform duration-300 ease-in-out lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarOpen ? 'block' : 'hidden lg:block'}
      `}>
        <ChatSidePanel
          ref={chatSidePanelRef}
          user={user}
          chatId={chatId}
          setChatId={setChatId}
          setMessages={setMessages}
          setPhase={setPhase}
          onResetSession={resetSession}
          isBotResponding={isBotResponding}
        />
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Provider Selection - Responsive */}
            <div className="ml-auto">
              <ProviderSelector
                provider={provider}
                setProvider={setProvider}
                phase={phase}
                defaultModel={DEFAULT_MODEL}
              />
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-visible">
          <ChatMessages messages={messages} isBotResponding={isBotResponding} />

          <div className="w-full px-3 sm:px-6 py-3 sm:py-6">
            {/* Answer Options */}
            {phase === "clarifying" && questionsData[currentQuestionIndex] && (
              <QuestionBlock
                currentQuestionOptions={
                  questionsData[currentQuestionIndex].options
                }
                customAnswer={customAnswer}
                setCustomAnswer={setCustomAnswer}
                onAnswerSubmit={handleAnswerSubmit}
                isBotResponding={isBotResponding}
              />
            )}

            {/* Model Selection */}
            {phase === "model-selection" && (
              <ModelSelection
                onModelSelect={handleModelSelect}
                isBotResponding={isBotResponding}
              />
            )}
          </div>

          {/* Invisible div for auto-scroll - this is the target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          onResetSession={resetSession}
          isBotResponding={isBotResponding}
          phase={phase}
        />
      </div>
    </div>
  );
}
