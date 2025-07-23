"use client";
import React, { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";
import {
  QUESTION_PROVIDERS,
  RESPONSE_PROVIDERS,
  getQuestionProviderById,
} from "@/lib/ai-config";
import { createClarifyPrompt, createImprovePrompt } from "@/lib/ai-helpers";

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

// Provider tile component for model selection
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

  return (
    <div className="bg-gray-600 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{providerConfig.icon}</span>
        <h5 className="font-medium text-white">{providerConfig.name}</h5>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-300">Model:</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={disabled}
        >
          {providerConfig.models.map((modelOption) => (
            <option key={modelOption.id} value={modelOption.id}>
              {modelOption.name}
              {modelOption.id === providerConfig.recommendedModel
                ? " (Zalecany)"
                : ""}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onSelect(providerConfig.id as Provider, selectedModel)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors disabled:opacity-50"
        disabled={disabled}
      >
        Wybierz {providerConfig.name}
      </button>

      <div className="text-xs text-gray-400">
        {providerConfig.models.find((m) => m.id === selectedModel)?.description}
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

      // Show first question
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

    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "🧠 Ulepszony prompt:" },
      { from: "bot", text: prompt },
    ]);

    if (chatId) {
      await sendMessageToServer(chatId, user.id, "bot", "🧠 Ulepszony prompt:");
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
      // All questions answered - go to model selection
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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/5 border-r border-gray-200 p-4 bg-gray-900 text-white">
        <h3 className="text-lg font-semibold mb-4">Ostatnie czaty</h3>
        <ul className="space-y-2">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`hover:bg-gray-800 rounded px-2 py-1 cursor-pointer transition-colors ${
                chatId === chat.id ? "bg-gray-700" : ""
              }`}
              onClick={() => handleChatSelectForViewing(chat)}
            >
              {chat.title || "Bez tytułu"}
            </li>
          ))}
        </ul>
      </div>
      {/* Main Chat */}
      <div className="w-4/5 flex flex-col bg-gray-800 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
          <span className="text-white">
            Hello <span className="font-semibold">{user.email || "User"}</span>
          </span>
          <form action={logout}>
            <button
              type="submit"
              className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition"
            >
              Logout
            </button>
          </form>
        </div>
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="my-2">
              <b>{msg.from === "user" ? "Ty" : "AI"}:</b> {msg.text}
            </div>
          ))}

          {/* Show answer options when in clarifying phase */}
          {phase === "clarifying" && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <h4 className="font-semibold mb-3">Wybierz odpowiedź:</h4>
              <div className="space-y-2">
                {currentQuestionOptions.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit(option)}
                    className="w-full text-left p-3 bg-gray-600 hover:bg-gray-500 rounded transition-colors disabled:opacity-50"
                    disabled={isBotResponding}
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </button>
                ))}

                <div className="mt-4 pt-3 border-t border-gray-600">
                  <label className="block text-sm font-medium mb-2">
                    {String.fromCharCode(65 + currentQuestionOptions.length)}.
                    Lub wpisz swoją odpowiedź:
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        customAnswer.trim() &&
                        handleAnswerSubmit(customAnswer)
                      }
                      className="flex-1 px-3 py-2 rounded bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Twoja odpowiedź..."
                      disabled={isBotResponding}
                    />
                    <button
                      onClick={() => handleAnswerSubmit(customAnswer)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50"
                      disabled={isBotResponding || !customAnswer.trim()}
                    >
                      Wyślij
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show model selection when in model-selection phase */}
          {phase === "model-selection" && (
            <div className="mt-4 p-4 bg-gray-700 rounded">
              <h4 className="font-semibold mb-3">
                Wybierz model AI do finalnej odpowiedzi:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        {/* Provider Selection for Questions */}
        <div className="p-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              Provider do pytań:
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                className="px-2 py-1 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={phase !== "init"}
              >
                {QUESTION_PROVIDERS.map((questionProvider) => (
                  <option key={questionProvider.id} value={questionProvider.id}>
                    {questionProvider.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="text-sm text-gray-300">
              Model:{" "}
              <span className="text-blue-400 font-mono">
                {getQuestionProviderById(provider)?.model || DEFAULT_MODEL}
              </span>
            </div>
          </div>
        </div>
        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 flex items-center gap-3 bg-gray-900">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder={
              phase === "init"
                ? "Zadaj pytanie do AI..."
                : "Nowa sesja lub podgląd historii"
            }
            disabled={
              isBotResponding ||
              phase === "done" ||
              phase === "clarifying" ||
              phase === "model-selection"
            }
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isBotResponding ||
              !input.trim() ||
              phase === "done" ||
              phase === "clarifying" ||
              phase === "model-selection"
            }
          >
            {isBotResponding ? "Czekaj..." : "Wyślij"}
          </button>
          {phase === "done" && (
            <button
              onClick={resetSession}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
            >
              Nowa sesja
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
