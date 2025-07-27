"use client";
import { useState, useEffect, useRef } from "react";
import { QUESTION_PROVIDERS, getQuestionProviderById } from "@/lib/ai-config";
import { createImprovePrompt } from "@/lib/ai-helpers";
import type { Provider, Phase, Message, QuestionData, User } from "@/lib/types";
import ChatSidePanel, {
  ChatSidePanelHandle,
} from "@/components/private/ChatSidePanel";
import QuestionBlock from "@/components/private/QuestionBlock";
import ChatMessages from "@/components/private/ChatMessages";
import ProviderSelector from "@/components/private/ProviderSelector";
import ModelSelection from "@/components/private/ModelSelection";
import ChatInput from "@/components/private/ChatInput";
import { useQuestionGenerator } from "@/components/private/QuestionGenerator";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export default function ChatClient({ user }: { user: User }) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

  // State consolidation
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Ask a question and I'll help you refine it!" },
  ]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [phase, setPhase] = useState<Phase>("init");
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [clarifyingIndex, setClarifyingIndex] = useState(0);
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [currentQuestionOptions, setCurrentQuestionOptions] = useState<
    string[]
  >([]);
  const [customAnswer, setCustomAnswer] = useState("");
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);

  const getProviderEndpoint = (provider: Provider) =>
    ({
      openai: "/api/chat/openai",
      perplexity: "/api/chat/perplexity",
      deepseek: "/api/chat/deepseek",
      gemini: "/api/chat/gemini",
      anthropic: "/api/chat/anthropic",
      grok: "/api/chat/grok",
    }[provider]);

  // Use the question generator hook
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getQuestionProviderById,
    getProviderEndpoint: (p: string) => getProviderEndpoint(p as Provider),
  });

  // Utility functions
  const resetSession = () => {
    setMessages([
      { from: "bot", text: "Ask a question and I'll help you refine it!" },
    ]);
    setInput("");
    setPhase("init");
    setClarifyingQuestions([]);
    setClarifyingAnswers([]);
    setClarifyingIndex(0);
    setOriginalQuestion("");
    setChatId(null);
    setCurrentQuestionOptions([]);
    setCustomAnswer("");
    setQuestionsData([]);
  };

  // Main message handling
  const handleSend = async () => {
    if (!input.trim() || isBotResponding) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const questionProvider = getQuestionProviderById(provider);
      const currentModel = questionProvider?.model || DEFAULT_MODEL;
      currentChatId =
        (await chatSidePanelRef.current?.createChat(input, currentModel)) ||
        null;
      setChatId(currentChatId);
    }

    setIsBotResponding(true);
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    if (currentChatId) {
      await chatSidePanelRef.current?.sendMessage(currentChatId, "user", input);
    }

    try {
      if (phase === "init") {
        await handleInitialQuestion(input, currentChatId);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "An error occurred. Please try again." },
      ]);
    }
    setIsBotResponding(false);
  };

  const handleInitialQuestion = async (
    question: string,
    currentChatId: string | null
  ) => {
    setOriginalQuestion(question);
    setInput("");

    try {
      const questionsWithOptions = await generateClarifyingQuestions(question);

      if (questionsWithOptions.length > 0) {
        setQuestionsData(questionsWithOptions);
        setClarifyingQuestions(
          questionsWithOptions.map((q: QuestionData) => q.question)
        );
        setPhase("clarifying");
        setClarifyingIndex(0);
        setClarifyingAnswers([]);
        setCurrentQuestionOptions(questionsWithOptions[0].options);

        const firstQuestion = questionsWithOptions[0].question;
        setMessages((prev) => [...prev, { from: "bot", text: firstQuestion }]);
        if (currentChatId) {
          await chatSidePanelRef.current?.sendMessage(
            currentChatId,
            "bot",
            firstQuestion
          );
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating clarifying questions. Please try again.",
        },
      ]);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!chatId || isBotResponding || !answer.trim()) return;

    setIsBotResponding(true);
    setMessages((prev) => [...prev, { from: "user", text: answer }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", answer);

    const newAnswers = [...clarifyingAnswers, answer];
    setClarifyingAnswers(newAnswers);
    setCustomAnswer("");
    await proceedToNextQuestion();
    setIsBotResponding(false);
  };

  const handleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (!chatId || isBotResponding) return;

    setIsBotResponding(true);
    const choiceText = `I choose: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    setMessages((prev) => [...prev, { from: "user", text: choiceText }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", choiceText);

    setPhase("improving");
    const endpoint = getProviderEndpoint(selectedProvider);
    const improvePrompt = createImprovePrompt(
      originalQuestion,
      clarifyingAnswers
    );

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: improvePrompt, model: selectedModel }),
      });
      const data = await response.json();
      const prompt = data.response || data.content;

      setMessages((prev) => [...prev, { from: "bot", text: prompt }]);

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(chatId, "bot", prompt);
      }

      setPhase("done");
    } catch (error) {
      console.error("Error generating improved prompt:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating the improved prompt. Please try again.",
        },
      ]);
      setPhase("model-selection");
    }

    setIsBotResponding(false);
  };

  const proceedToNextQuestion = async () => {
    const nextIndex = clarifyingIndex + 1;
    if (nextIndex < clarifyingQuestions.length) {
      const nextQuestion = clarifyingQuestions[nextIndex];
      setClarifyingIndex(nextIndex);
      if (questionsData[nextIndex]) {
        setCurrentQuestionOptions(questionsData[nextIndex].options);
      }
      setMessages((prev) => [...prev, { from: "bot", text: nextQuestion }]);
      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          nextQuestion
        );
      }
    } else {
      setPhase("model-selection");
      const selectionMessage =
        "Great! Now choose the AI model that should generate the final response:";
      setMessages((prev) => [...prev, { from: "bot", text: selectionMessage }]);
      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          selectionMessage
        );
      }
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.05),transparent_50%)]" />

        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

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
            {phase === "clarifying" && (
              <QuestionBlock
                currentQuestionOptions={currentQuestionOptions}
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
