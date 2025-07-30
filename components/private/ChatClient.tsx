"use client";
import type { User } from "@/lib/types";
import ChatSidePanel from "@/components/private/ChatSidePanel";
import QuestionBlock from "@/components/private/QuestionBlock";
import ChatMessages from "@/components/private/ChatMessages";
import ProviderSelector from "@/components/private/ProviderSelector";
import ModelSelection from "@/components/private/ModelSelection";
import ChatInput from "@/components/private/ChatInput";
import { Background } from "@/components/ui/background";
import { useChat } from "@/hooks/private/mainPanel/useChat";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export default function ChatClient({ user }: { user: User }) {
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

      {/* Sidebar */}
      <ChatSidePanel
        ref={chatSidePanelRef}
        user={user}
        chatId={chatId}
        setChatId={setChatId}
        setMessages={setMessages}
        setPhase={setPhase}
        onResetSession={resetSession}
      />

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 p-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Build the future of{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI prompts
                </span>
              </h1>
              <p className="text-gray-400">
                Everything you need to create{" "}
                <span className="text-white font-semibold">
                  perfect AI prompts
                </span>{" "}
                with precision.
              </p>
            </div>

            {/* Provider Selection */}
            <ProviderSelector
              provider={provider}
              setProvider={setProvider}
              phase={phase}
              defaultModel={DEFAULT_MODEL}
            />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-visible">
          <ChatMessages messages={messages} isBotResponding={isBotResponding} />

          <div className="max-w-5xl mx-auto p-6">
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
