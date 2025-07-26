"use client";
import { useState, useEffect, useRef } from "react";
import {
  QUESTION_PROVIDERS,
  RESPONSE_PROVIDERS,
  getQuestionProviderById,
} from "@/lib/ai-config";
import { createImprovePrompt } from "@/lib/ai-helpers";
import ChatSidePanel, {
  ChatSidePanelHandle,
} from "@/components/private/ChatSidePanel";
import QuestionBlock from "@/components/private/QuestionBlock";
import ChatMessages from "@/components/private/ChatMessages";
import { useQuestionGenerator } from "@/components/private/QuestionGenerator";
import {
  Send,
  Settings,
  Sparkles,
  ChevronDown,
  Check,
  ArrowRight,
  Plus,
} from "lucide-react";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

type Provider =
  | "openai"
  | "perplexity"
  | "deepseek"
  | "gemini"
  | "anthropic"
  | "grok";

type Phase = "init" | "clarifying" | "model-selection" | "improving" | "done";

interface Message {
  from: "user" | "bot";
  text: string;
}

interface QuestionData {
  question: string;
  options: string[];
}

interface ProviderConfig {
  id: string;
  name: string;
  icon: string;
  models: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  recommendedModel: string;
}

// Next.js inspired Provider tile component
function ProviderTile({
  providerConfig,
  onSelect,
  disabled,
}: {
  providerConfig: ProviderConfig;
  onSelect: (provider: Provider, model: string) => void;
  disabled: boolean;
}) {
  const [selectedModel, setSelectedModel] = useState(
    providerConfig.recommendedModel
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isExpanded]);

  return (
    <div
      className={`group relative bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:bg-black/60 hover:border-gray-700/50 transition-all duration-300 ${
        isExpanded ? "z-[1000]" : "z-10"
      }`}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
            {providerConfig.icon}
          </div>
          <div>
            <h5 className="font-bold text-white text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
              {providerConfig.name}
            </h5>
            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
              AI Provider
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl text-sm font-medium text-gray-200 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200"
              disabled={disabled}
            >
              <span className="flex items-center gap-2">
                {
                  providerConfig.models.find((m) => m.id === selectedModel)
                    ?.name
                }
                {selectedModel === providerConfig.recommendedModel && (
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[999] max-h-60 overflow-y-auto">
                {providerConfig.models.map((modelOption) => (
                  <button
                    key={modelOption.id}
                    onClick={() => {
                      setSelectedModel(modelOption.id);
                      setIsExpanded(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-800/60 flex items-center justify-between text-gray-200 hover:text-white transition-all duration-200 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {modelOption.name}
                      </div>
                      {modelOption.description && (
                        <div className="text-xs text-gray-400 mt-1 truncate">
                          {modelOption.description}
                        </div>
                      )}
                    </div>
                    {selectedModel === modelOption.id && (
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Backdrop to close dropdown when clicking outside */}
            {isExpanded && (
              <div
                className="fixed inset-0 z-[998]"
                onClick={() => setIsExpanded(false)}
              />
            )}
          </div>

          <button
            onClick={() =>
              onSelect(providerConfig.id as Provider, selectedModel)
            }
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn shadow-lg hover:shadow-xl"
            disabled={disabled}
          >
            <Sparkles className="w-4 h-4" />
            Select
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface User {
  id: string;
  email?: string;
}

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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300 font-medium">
                  Provider:
                </span>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as Provider)}
                  className="px-3 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-600/50 transition-all duration-200"
                  disabled={phase !== "init"}
                >
                  {QUESTION_PROVIDERS.map((questionProvider) => (
                    <option
                      key={questionProvider.id}
                      value={questionProvider.id}
                    >
                      {questionProvider.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-gray-400 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/50 font-mono">
                {getQuestionProviderById(provider)?.modleName || DEFAULT_MODEL}
              </div>
            </div>
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
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    What do AI models contain?
                  </h3>
                  <p className="text-xl text-gray-400">
                    Everything you need to generate perfect responses.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                  {RESPONSE_PROVIDERS.map((providerConfig) => (
                    <ProviderTile
                      key={providerConfig.id}
                      providerConfig={providerConfig}
                      onSelect={handleModelSelect}
                      disabled={isBotResponding}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-black/40 backdrop-blur-md border-t border-gray-800/50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="w-full px-6 py-4 pr-14 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-700/50 transition-all duration-200 text-lg font-medium"
                  placeholder={
                    phase === "init"
                      ? "Ask AI a question..."
                      : "Start a new session or browse history..."
                  }
                  disabled={
                    isBotResponding ||
                    phase === "done" ||
                    phase === "clarifying" ||
                    phase === "model-selection"
                  }
                />
                {phase === "done" ? (
                  <button
                    onClick={resetSession}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Session
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={
                      isBotResponding ||
                      !input.trim() ||
                      phase === "clarifying" ||
                      phase === "model-selection"
                    }
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4 text-center">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
