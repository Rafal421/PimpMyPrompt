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
import { ChatMessagesSkeleton } from "@/components/private/chat/skeletons/ChatMessagesSkeleton";
import QuestionBlock from "@/components/private/modes/PMP/QuestionBlock";
import ModelSelection from "@/components/private/modes/PMP/ModelSelection";
import CompareModelSelection from "@/components/private/modes/Compare/CompareModelSelection";

interface ChatClientProps {
  user: User;
  mode?: ChatMode;
}
export default function ChatClient({ user, mode = "pmp" }: ChatClientProps) {
  useSessionTimeout();

  const chat = useChatAdapter(mode, { user });

  const [currentChat, setCurrentChat] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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

  const handleTitleUpdate = async (newTitle: string) => {
    if (!currentChat) return;
    try {
      await chat.chatSidePanelRef.current?.updateChatTitle(
        currentChat.id,
        newTitle,
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
            selectedModels={chat.selectedModels || []}
            onToggleModel={chat.toggleModel || (() => {})}
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
                    height: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
                    opacity: { duration: 0.15, ease: "easeOut" },
                    marginTop: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
                    scale: { duration: 0.15, ease: "easeOut" },
                  },
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  scale: 0.95,
                  transition: {
                    opacity: { duration: 0.1, ease: "easeIn" },
                    scale: { duration: 0.1, ease: "easeIn" },
                    height: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
                    marginTop: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
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
                  height: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
                  opacity: { duration: 0.15, ease: "easeOut" },
                  marginTop: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
                  scale: { duration: 0.15, ease: "easeOut" },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginTop: 0,
                scale: 0.95,
                transition: {
                  opacity: { duration: 0.1, ease: "easeIn" },
                  scale: { duration: 0.1, ease: "easeIn" },
                  height: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
                  marginTop: { duration: 0.15, ease: [0.4, 0.0, 0.2, 1] },
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
        chat.phase,
      )) ||
    (chat.mode === "compare" &&
      (!chat.selectedModels || chat.selectedModels.length === 0));

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
          onLoadingMessages={setIsLoadingMessages}
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
      <div className="flex-1 overflow-y-auto overflow-x-visible scroll-smooth">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">
          {isLoadingMessages ? (
            <ChatMessagesSkeleton />
          ) : (
            <ChatMessages
              messages={chat.messages}
              isLoading={chat.isLoading}
              renderExtras={renderExtras}
              chatId={chat.chatId}
            />
          )}
          <div ref={chat.messagesEndRef} className="h-12 sm:h-20" />
        </div>
      </div>

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
        showProviderSelector={chat.mode === "simple"}
        selectedProvider={
          chat.mode === "simple" ? chat.selectedProvider : undefined
        }
        selectedModel={chat.mode === "simple" ? chat.selectedModel : undefined}
        onProviderChange={
          chat.mode === "simple"
            ? (p: string, m: string) => {
                chat.setSelectedProvider(p);
                chat.setSelectedModel(m);
              }
            : undefined
        }
      />
    </ChatLayout>
  );
}
