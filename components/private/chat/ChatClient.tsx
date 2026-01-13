"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "@/lib/shared/types";
import { useSessionTimeout } from "@/hooks/auth/useSessionTimeout";
import { useChatAdapter, type ChatMode } from "@/hooks/private/useChatAdapter";
import ChatLayout from "./ChatLayout";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatSidePanel from "@/components/private/chat/ChatSidePanel";
import QuestionBlock from "@/components/private/modes/PMP/QuestionBlock";
import ModelSelection from "@/components/private/modes/PMP/ModelSelection";
import CompareModelSelection from "@/components/private/modes/Compare/CompareModelSelection";

interface ChatClientProps {
  user: User;
  mode?: ChatMode;
}
export default function ChatClient({ user, mode = "pmp" }: ChatClientProps) {
  useSessionTimeout();

  // Get chat logic based on mode
  const chat = useChatAdapter(mode, { user });

  // Local UI state
  const [currentChat, setCurrentChat] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // Auto scroll on phase/question changes (PMP specific)
  useEffect(() => {
    if (chat.mode === "pmp" && chat.messagesEndRef) {
      const timer = setTimeout(() => {
        chat.messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [chat.mode === "pmp" ? chat.phase : null, chat.messagesEndRef]);

  /** handleTitleUpdate - Updates the chat title via API */
  const handleTitleUpdate = async (newTitle: string) => {
    if (!currentChat) return;
    try {
      await chat.chatSidePanelRef.current?.updateChatTitle(
        currentChat.id,
        newTitle
      );
      setCurrentChat({ ...currentChat, title: newTitle });
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  };

  const renderExtras = () => {
    if (chat.mode === "compare") {
      return (
        <div className="w-full px-2 py-4">
          <CompareModelSelection
            selectedProviders={chat.selectedProviders || []}
            onToggleProvider={chat.toggleProvider || (() => {})}
            disabled={chat.isLoading}
          />
        </div>
      );
    }

    if (chat.mode !== "pmp") return null;

    return (
      <>
        {/* Question Block */}
        <AnimatePresence mode="wait">
          {chat.phase === "clarifying" &&
            chat.questionsData?.[chat.currentQuestionIndex] && (
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
                    chat.questionsData[chat.currentQuestionIndex].options
                  }
                  customAnswer={chat.customAnswer || ""}
                  setCustomAnswer={chat.setCustomAnswer || (() => {})}
                  onAnswerSubmit={chat.handleAnswerSubmit || (() => {})}
                  isBotResponding={chat.isLoading}
                />
              </motion.div>
            )}
        </AnimatePresence>

        {/* Model Selection */}
        <AnimatePresence mode="wait">
          {chat.phase === "model-selection" && (
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
              className="flex justify-center overflow-hidden"
            >
              <ModelSelection
                onModelSelect={chat.handleModelSelect || (() => {})}
                isBotResponding={chat.isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  /** getPlaceholder - Returns appropriate placeholder text based on mode and state */
  const getPlaceholder = () => {
    if (!chat.canMakeRequest) return "Daily limit reached.";
    if (chat.mode === "pmp") {
      return chat.phase === "init"
        ? "Ask AI a question..."
        : "New session or browse history...";
    }
    return "Type your message...";
  };

  const showResetButton =
    chat.mode === "pmp" && chat.phase === "done" && chat.messages.length > 0;

  const isInputDisabled =
    chat.isLoading ||
    !chat.canMakeRequest ||
    (chat.mode === "pmp" &&
      ["clarifying", "improving", "model-selection", "final-response"].includes(
        chat.phase
      ));

  return (
    <ChatLayout
      sidebar={
        <ChatSidePanel
          ref={chat.chatSidePanelRef}
          user={user}
          chatId={chat.chatId}
          setChatId={chat.setChatId}
          setMessages={chat.setMessages}
          setPhase={chat.mode === "pmp" ? chat.setPhase : () => {}}
          onResetSession={chat.resetSession}
          isBotResponding={chat.isLoading}
          onCurrentChatChange={setCurrentChat}
        />
      }
      header={
        currentChat
          ? {
              title: currentChat.title,
              onTitleEdit: handleTitleUpdate,
              canEditTitle: !chat.isLoading,
              mode,
            }
          : {
              title: "New Chat",
              canEditTitle: false,
              mode,
            }
      }
    >
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-visible scroll-smooth">
        <div
          className={`w-full ${
            mode === "compare" ? "max-w-5xl" : "max-w-4xl"
          } mx-auto px-2 sm:px-1 py-2 sm:py-2`}
        >
          <ChatMessages
            messages={chat.messages}
            isLoading={chat.isLoading}
            renderExtras={renderExtras}
            chatId={chat.chatId}
          />
          {/* Scroll target */}
          <div ref={chat.messagesEndRef} className="h-12 sm:h-20" />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        value={chat.input}
        onChange={chat.setInput}
        onSend={chat.handleSend}
        onStop={chat.stopGeneration}
        onReset={chat.resetSession}
        disabled={isInputDisabled}
        isLoading={chat.isLoading}
        placeholder={getPlaceholder()}
        showResetButton={showResetButton}
        requestsRemaining={chat.requestsRemaining}
        getTimeUntilReset={chat.getTimeUntilReset}
        onFocus={chat.checkUsage}
      />
    </ChatLayout>
  );
}
