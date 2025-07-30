"use client";
import { useState, useRef } from "react";
import { getQuestionProviderById } from "@/lib/ai-config";
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
import { Background } from "@/components/ui/background";
import { useAutoScroll } from "@/hooks/useAutoScroll";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

export default function ChatClient({ user }: { user: User }) {
  const chatSidePanelRef = useRef<ChatSidePanelHandle>(null);

  // Core state
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Ask a question and I'll help you refine it!" },
  ]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider>("anthropic");
  const [phase, setPhase] = useState<Phase>("init");

  // Question flow state
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [improvedPrompt, setImprovedPrompt] = useState("");
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([]);
  const [customAnswer, setCustomAnswer] = useState("");
  const messagesEndRef = useAutoScroll(messages, 100);

  // Simple API helper
  const callAPI = async (
    message: string,
    targetProvider: Provider,
    model: string
  ) => {
    const endpoint = `/api/chat/${targetProvider}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model }),
    });
    const data = await response.json();
    return data.response || data.content;
  };

  // Use the question generator hook
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getQuestionProviderById,
    getProviderEndpoint: (p: string) => `/api/chat/${p}`,
  });

  // Reset session
  const resetSession = () => {
    setMessages([
      { from: "bot", text: "Ask a question and I'll help you refine it!" },
    ]);
    setInput("");
    setPhase("init");
    setOriginalQuestion("");
    setImprovedPrompt("");
    setClarifyingAnswers([]);
    setCurrentQuestionIndex(0);
    setQuestionsData([]);
    setCustomAnswer("");
    setChatId(null);
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
        await startQuestionFlow(input, currentChatId);
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

  // Start question flow
  const startQuestionFlow = async (
    question: string,
    currentChatId: string | null
  ) => {
    setOriginalQuestion(question);
    setInput("");

    try {
      const questionsWithOptions = await generateClarifyingQuestions(question);

      if (questionsWithOptions.length > 0) {
        setQuestionsData(questionsWithOptions);
        setPhase("clarifying");
        setCurrentQuestionIndex(0);
        setClarifyingAnswers([]);

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
    if (!chatId || isBotResponding || !improvedPrompt) return;

    setIsBotResponding(true);
    const choiceText = `I choose: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    setMessages((prev) => [...prev, { from: "user", text: choiceText }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", choiceText);

    setPhase("final-response");

    try {
      const finalResponse = await callAPI(
        improvedPrompt,
        selectedProvider,
        selectedModel
      );

      setMessages((prev) => [...prev, { from: "bot", text: finalResponse }]);

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          finalResponse
        );
      }

      setPhase("done");
    } catch (error) {
      console.error("Error generating final response:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating the final response. Please try again.",
        },
      ]);
      setPhase("model-selection");
    }

    setIsBotResponding(false);
  };

  // Generate improved prompt
  const generateImprovedPrompt = async () => {
    if (!chatId) return;

    setPhase("improving");

    const questionProvider = getQuestionProviderById(provider);
    const currentModel = questionProvider?.model || DEFAULT_MODEL;
    const improvePrompt = createImprovePrompt(
      originalQuestion,
      clarifyingAnswers
    );

    try {
      const prompt = await callAPI(improvePrompt, provider, currentModel);

      setImprovedPrompt(prompt);
      setMessages((prev) => [...prev, { from: "bot", text: prompt }]);

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(chatId, "bot", prompt);
      }

      setPhase("model-selection");
    } catch (error) {
      console.error("Error generating improved prompt:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating the improved prompt. Please try again.",
        },
      ]);
      setPhase("clarifying");
    }
  };

  // Move to next question or finish
  const proceedToNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questionsData.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionsData[nextIndex].question;

      setMessages((prev) => [...prev, { from: "bot", text: nextQuestion }]);
      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          nextQuestion
        );
      }
    } else {
      await generateImprovedPrompt();
    }
  };

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
