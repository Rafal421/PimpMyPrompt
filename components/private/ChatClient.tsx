"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isDesktop, setIsDesktop] = useState(false);
  const { error, hideError, handleApiError } = useErrorToast();

  // Close sidebar on window resize and check screen size
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

      // Always close sidebar on resize for mobile
      if (!desktop) {
        setIsSidebarOpen(false);
      }
    };
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
    <div className="flex h-[100svh] bg-black overflow-hidden">
      {/* Animated background */}
      <Background />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop always visible, Mobile overlay */}
      <motion.div
        initial={false}
        animate={{
          x: isDesktop ? 0 : isSidebarOpen ? 0 : "-100%",
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed lg:relative inset-y-0 left-0 z-50 lg:z-10 lg:!translate-x-0 lg:block"
        style={{
          transform:
            typeof window !== "undefined" && window.innerWidth >= 1024
              ? "translateX(0)"
              : undefined,
        }}
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
      </motion.div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm max-h-[100svh]">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 text-white hover:bg-white/10 rounded-lg"
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
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-1 py-2 sm:py-2">
            <ChatMessages
              messages={messages}
              isBotResponding={isBotResponding}
            />

            {/* Answer Options */}
            <AnimatePresence mode="wait">
              {phase === "clarifying" &&
                questionsData[currentQuestionIndex] && (
                  <motion.div
                    key="question-block"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.4, 0.0, 0.2, 1],
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                    }}
                    className="w-full px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6"
                  >
                    <QuestionBlock
                      currentQuestionOptions={
                        questionsData[currentQuestionIndex].options
                      }
                      customAnswer={customAnswer}
                      setCustomAnswer={setCustomAnswer}
                      onAnswerSubmit={handleAnswerSubmit}
                      isBotResponding={isBotResponding}
                    />
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Model Selection */}
            <AnimatePresence mode="wait">
              {phase === "model-selection" && (
                <motion.div
                  key="model-selection"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.4, 0.0, 0.2, 1],
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                  className="flex justify-center px-3 sm:px-6 mt-4"
                >
                  <ModelSelection
                    onModelSelect={handleModelSelect}
                    isBotResponding={isBotResponding}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Invisible div for auto-scroll - this is the target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div>
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
