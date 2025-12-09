"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@/lib/types";
import ChatSidePanel from "@/components/private/shared/ChatSidePanel";
import ChatMessages from "@/components/private/ChatMessages";
import ChatInput from "@/components/private/shared/ChatInput";
import { Background } from "@/components/ui/background";
import { useChat } from "@/hooks/private/shared/useChat";
import { Menu, X, Edit3 } from "lucide-react";

export default function ChatClient({ user }: { user: User }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);

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
    canMakeRequest,
    requestsRemaining,
    getTimeUntilReset,
    checkUsage,
  } = useChat({ user });

  // Auto scroll on phase changes (when QuestionBlock appears/disappears)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    }, 500); // Small delay to let animation start

    return () => clearTimeout(timer);
  }, [phase, questionsData, messagesEndRef]);

  // Functions for editing chat title
  const handleTitleClick = () => {
    if (currentChat && !isBotResponding) {
      setIsEditingTitle(true);
      setEditTitle(currentChat.title);
    }
  };

  const handleTitleSave = async () => {
    if (!currentChat || !editTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    if (editTitle.trim() === currentChat.title) {
      setIsEditingTitle(false);
      return;
    }

    try {
      // Update title via chat side panel
      await chatSidePanelRef.current?.updateChatTitle(
        currentChat.id,
        editTitle.trim()
      );
      setCurrentChat({ ...currentChat, title: editTitle.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update chat title:", error);
      // Revert to original title on error
      setEditTitle(currentChat.title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditTitle("");
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSave();
    } else if (e.key === "Escape") {
      handleTitleCancel();
    }
  };

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
          onCurrentChatChange={setCurrentChat}
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

            {/* Chat Title - Centered */}
            <div className="flex-1 flex items-center justify-center">
              {currentChat ? (
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleTitleSave}
                      className="bg-gray-800/50 text-white text-base font-semibold px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none max-w-48"
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        onClick={handleTitleClick}
                        disabled={isBotResponding}
                        className="text-base font-semibold text-white hover:text-blue-300 transition-colors truncate max-w-48 text-center disabled:cursor-not-allowed disabled:hover:text-white"
                        title="Click to edit chat name"
                      >
                        {currentChat.title}
                      </button>
                      <div
                        className="cursor-pointer"
                        onClick={handleTitleClick}
                        title="Edit chat name"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-300 transition-colors opacity-60" />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-base font-semibold text-gray-400">
                  New Chat
                </div>
              )}
            </div>

            {/* Provider Selection - Right side */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/50 font-mono">
                GPT-4o Mini
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-visible scroll-smooth">
          <div className="w-full max-w-4xl mx-auto px-2 sm:px-1 py-2 sm:py-2">
            <ChatMessages
              messages={messages}
              isBotResponding={isBotResponding}
              phase={phase}
              questionsData={questionsData}
              currentQuestionIndex={currentQuestionIndex}
              customAnswer={customAnswer}
              setCustomAnswer={setCustomAnswer}
              onAnswerSubmit={handleAnswerSubmit}
              onModelSelect={handleModelSelect}
            />

            {/* Scroll target - at the very end */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
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
            canMakeRequest={canMakeRequest}
            requestsRemaining={requestsRemaining}
            getTimeUntilReset={getTimeUntilReset}
            checkUsage={checkUsage}
          />
        </div>
      </div>
    </div>
  );
}
