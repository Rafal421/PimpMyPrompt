"use client";
import { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";
import {
  QUESTION_PROVIDERS,
  RESPONSE_PROVIDERS,
  getQuestionProviderById,
} from "@/lib/ai-config";
import { createClarifyPrompt, createImprovePrompt } from "@/lib/ai-helpers";
import {
  Send,
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  UserIcon,
  Bot,
  Sparkles,
  ChevronDown,
  Check,
  ArrowRight,
  Trash2,
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
                    Zalecany
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
            Wybierz
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

interface Chat {
  id: string;
  title: string;
}

export default function ChatClient({ user }: { user: User }) {
  // State consolidation
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "Zadaj pytanie, a pomogę Ci je doprecyzować!" },
  ]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
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

  // API helper functions
  const createChat = async (
    user_id: string,
    title: string,
    usedModel: string
  ) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, title: `${title} (${usedModel})` }),
    });
    const data = await res.json();
    return data.chat.id;
  };

  const sendMessageToServer = async (
    chat_id: string,
    user_id: string,
    from: string,
    content: string
  ) => {
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, user_id, from, content }),
      });
    } catch (error) {
      console.error("Error sending message to server:", error);
    }
  };

  const getProviderEndpoint = (provider: Provider) =>
    ({
      openai: "/api/chat/openai",
      perplexity: "/api/chat/perplexity",
      deepseek: "/api/chat/deepseek",
      gemini: "/api/chat/gemini",
      anthropic: "/api/chat/anthropic",
      grok: "/api/chat/grok",
    }[provider]);

  const callProvider = async (
    action: "clarify" | "improve",
    payload: { question: string; answers?: string[] }
  ) => {
    const questionProvider = getQuestionProviderById(provider);
    const endpoint =
      action === "clarify"
        ? questionProvider?.endpoint || "/api/chat/anthropic"
        : getProviderEndpoint(provider);
    const modelToUse =
      action === "clarify"
        ? questionProvider?.model || DEFAULT_MODEL
        : questionProvider?.model || DEFAULT_MODEL;
    const promptContent =
      action === "clarify"
        ? createClarifyPrompt(payload.question)
        : createImprovePrompt(payload.question, payload.answers || []);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: promptContent, model: modelToUse }),
    });
    const data = await response.json();
    return action === "clarify" && data.questions
      ? { questionsWithOptions: data.questions }
      : data;
  };

  // Effects
  useEffect(() => {
    const fetchChats = async () => {
      const res = await fetch(`/api/chat?user_id=${user.id}`);
      const data = await res.json();
      setChats(data.chats || []);
    };
    fetchChats();
  }, [user.id]);

  // Utility functions
  const resetSession = () => {
    setMessages([
      { from: "bot", text: "Zadaj pytanie, a pomogę Ci je doprecyzować!" },
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

  const fetchChatHistory = async (chatId: string) => {
    const res = await fetch(`/api/messages?chat_id=${chatId}`);
    const data = await res.json();
    setMessages(
      data.messages.map((msg: { from: string; content: string }) => ({
        from: msg.from === "user" ? "user" : "bot",
        text: msg.content,
      }))
    );
  };

  const handleChatSelectForViewing = (chat: Chat) => {
    if (chat.id) {
      fetchChatHistory(chat.id);
      setChatId(chat.id);
      setPhase("done");
    }
  };

  const handleDeleteChat = async (
    chatIdToDelete: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering chat selection

    try {
      const res = await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatIdToDelete, user_id: user.id }),
      });

      if (res.ok) {
        // Remove chat from local state
        setChats((prev) => prev.filter((chat) => chat.id !== chatIdToDelete));

        // If the deleted chat was currently selected, reset session
        if (chatIdToDelete === chatId) {
          resetSession();
        }
      } else {
        console.error("Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  // Main message handling
  const handleSend = async () => {
    if (!input.trim() || isBotResponding) return;

    let currentChatId = chatId;
    if (!currentChatId) {
      const questionProvider = getQuestionProviderById(provider);
      const currentModel = questionProvider?.model || DEFAULT_MODEL;
      currentChatId = await createChat(user.id, input, currentModel);
      setChatId(currentChatId);
    }

    setIsBotResponding(true);
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    if (currentChatId) {
      await sendMessageToServer(currentChatId, user.id, "user", input);
    }

    try {
      if (phase === "init") {
        await handleInitialQuestion(input, currentChatId);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Wystąpił błąd. Spróbuj ponownie." },
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
    const data = await callProvider("clarify", { question });
    const questionsWithOptions = data.questionsWithOptions || [];

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
        await sendMessageToServer(currentChatId, user.id, "bot", firstQuestion);
      }
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!chatId || isBotResponding || !answer.trim()) return;

    setIsBotResponding(true);
    setMessages((prev) => [...prev, { from: "user", text: answer }]);
    await sendMessageToServer(chatId, user.id, "user", answer);

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
    const choiceText = `Wybieram: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    setMessages((prev) => [...prev, { from: "user", text: choiceText }]);
    await sendMessageToServer(chatId, user.id, "user", choiceText);

    setPhase("improving");
    const endpoint = getProviderEndpoint(selectedProvider);
    const improvePrompt = createImprovePrompt(
      originalQuestion,
      clarifyingAnswers
    );

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: improvePrompt, model: selectedModel }),
    });
    const data = await response.json();
    const prompt = data.response || data.content;

    setMessages((prev) => [...prev, { from: "bot", text: prompt }]);

    if (chatId) {
      await sendMessageToServer(chatId, user.id, "bot", prompt);
    }

    setPhase("done");
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
        await sendMessageToServer(chatId, user.id, "bot", nextQuestion);
      }
    } else {
      setPhase("model-selection");
      const selectionMessage =
        "Świetnie! Teraz wybierz model AI, który ma wygenerować finalną odpowiedź:";
      setMessages((prev) => [...prev, { from: "bot", text: selectionMessage }]);
      if (chatId) {
        await sendMessageToServer(chatId, user.id, "bot", selectionMessage);
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
      <div className="relative z-10 w-72 bg-black/40 backdrop-blur-md border-r border-gray-800/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Assistant</h2>
              <p className="text-gray-400 text-sm">Prompt Enhancement</p>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 group shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nowa rozmowa
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Ostatnie czaty
          </h3>
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`relative group w-full rounded-xl transition-all duration-200 border ${
                  chatId === chat.id
                    ? "bg-gray-800/50 border-gray-700/50"
                    : "bg-black/20 border-gray-800/30 hover:bg-gray-800/30 hover:border-gray-700/50"
                }`}
              >
                <div
                  className="w-full text-left p-4 rounded-xl cursor-pointer"
                  onClick={() => handleChatSelectForViewing(chat)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id, e);
                      }}
                      title="Usuń chat"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:hidden transition-all duration-200" />
                      <Trash2 className="w-4 h-4 text-red-400 hidden group-hover:block transition-all duration-200" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate leading-5">
                        {chat.title || "Bez tytułu"}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
                        Ostatnia rozmowa
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {user.email || "User"}
                </p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="relative z-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 p-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Zbuduj przyszłość{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI promptów
                </span>
              </h1>
              <p className="text-gray-400">
                Wszystko czego potrzebujesz do tworzenia{" "}
                <span className="text-white font-semibold">
                  idealnych promptów AI
                </span>{" "}
                z precyzją.
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
          <div className="max-w-5xl mx-auto p-6 space-y-8">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${
                  msg.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.from === "bot" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-2xl ${
                    msg.from === "user" ? "order-first" : ""
                  }`}
                >
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-lg ${
                      msg.from === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white ml-auto"
                        : "bg-black/40 backdrop-blur-sm border border-gray-800/50 text-gray-100"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap font-medium !m-0 !mt-0 !mb-0 !ml-0 !mr-0">
                      {msg.text}
                    </p>
                  </div>
                </div>

                {msg.from === "user" && (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Answer Options */}
            {phase === "clarifying" && (
              <div className="bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <h4 className="text-2xl font-bold text-white">
                    Wybierz odpowiedź
                  </h4>
                </div>

                <div className="space-y-4">
                  {currentQuestionOptions.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(option)}
                      className="w-full text-left p-4 bg-gray-900/50 backdrop-blur-sm hover:bg-gray-800/50 border border-gray-800/50 hover:border-gray-700/50 rounded-xl transition-all duration-300 disabled:opacity-50 group"
                      disabled={isBotResponding}
                    >
                      <div className="flex items-start gap-4">
                        <span className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-gray-200 group-hover:text-white font-medium leading-relaxed">
                          {option}
                        </span>
                      </div>
                    </button>
                  ))}

                  <div className="pt-6 border-t border-gray-800/50">
                    <div className="flex items-start gap-4 mb-4">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {String.fromCharCode(
                          65 + currentQuestionOptions.length
                        )}
                      </span>
                      <span className="text-gray-200 font-semibold">
                        Lub wpisz swoją odpowiedź:
                      </span>
                    </div>
                    <div className="flex gap-3 ml-12">
                      <input
                        value={customAnswer}
                        onChange={(e) => setCustomAnswer(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          customAnswer.trim() &&
                          handleAnswerSubmit(customAnswer)
                        }
                        className="flex-1 px-4 py-3 bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 hover:border-gray-700/50 transition-all duration-200"
                        placeholder="Twoja odpowiedź..."
                        disabled={isBotResponding}
                      />
                      <button
                        onClick={() => handleAnswerSubmit(customAnswer)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
                        disabled={isBotResponding || !customAnswer.trim()}
                      >
                        <Send className="w-4 h-4" />
                        Wyślij
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Model Selection */}
            {phase === "model-selection" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-white mb-4">
                    Co zawierają modele AI?
                  </h3>
                  <p className="text-xl text-gray-400">
                    Wszystko czego potrzebujesz do generowania idealnych
                    odpowiedzi.
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

            {/* Loading indicator */}
            {isBotResponding && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-black/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl px-6 py-4 shadow-lg">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
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
                      ? "Zadaj pytanie do AI..."
                      : "Rozpocznij nową sesję lub przeglądaj historię..."
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
                    Nowa Sesja
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
              AI może popełniać błędy. Sprawdź ważne informacje.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
