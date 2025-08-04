"use client";
import { useState, useEffect } from "react";
import type { User } from "@/lib/types";
import ChatSidePanel from "@/components/private/ChatSidePanel";
import QuestionBlock from "@/components/private/QuestionBlock";
import ChatMessages from "@/components/private/ChatMessages";
import ProviderSelector from "@/components/private/ProviderSelector";
import ModelSelection from "@/components/private/ModelSelection";
import ChatInput from "@/components/private/ChatInput";
import { Background } from "@/components/ui/background";
import { ErrorToast } from "@/components/ui/error-toast";
import { useChat } from "@/hooks/private/mainPanel/useChat";
import { useErrorToast } from "@/hooks/useErrorToast";
import { Menu, X } from "lucide-react";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export default function ChatClient({ user }: { user: User }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { error, hideError, handleApiError } = useErrorToast();

  // Close sidebar on window resize and check screen size
  useEffect(() => {
    const handleResize = () => {
      // Always close sidebar on resize
      setIsSidebarOpen(false);

      // Force close on smaller screens (below lg breakpoint - 1024px)
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    // Check initial screen size
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
  } = useChat({ user, onError: handleApiError });

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <Background />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-10
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
        lg:block
      `}
      >
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
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`absolute inset-0 w-5 h-5 ${
                    isSidebarOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 w-5 h-5 ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </button>

            {/* Provider Selection - Responsive */}
            <div className="ml-auto flex items-center gap-2">
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

      {/* Error Toast */}
      <ErrorToast
        message={error.message}
        details={error.details}
        onClose={hideError}
        isVisible={error.isVisible}
      />
    </div>
  );
}
