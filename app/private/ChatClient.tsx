"use client";
import React, { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";

type Provider =
  | "openai"
  | "perplexity"
  | "deepseek"
  | "gemini"
  | "anthropic"
  | "grok";
type Phase = "init" | "clarifying" | "improving" | "done";

export default function ChatClient({ user }: { user: any }) {
  // Chat state
  const [messages, setMessages] = useState([
    { from: "bot", text: "Zadaj pytanie, a pomogę Ci je doprecyzować!" },
  ]);
  const [input, setInput] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);

  // Chat management
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // AI Provider settings
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<string>("gpt-3.5-turbo");

  // Pimp My Prompt flow
  const [phase, setPhase] = useState<Phase>("init");
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const [clarifyingIndex, setClarifyingIndex] = useState(0);
  const [originalQuestion, setOriginalQuestion] = useState<string>("");
  const [improvedPrompt, setImprovedPrompt] = useState<string>("");
  const [currentQuestionOptions, setCurrentQuestionOptions] = useState<
    string[]
  >([]);
  const [customAnswer, setCustomAnswer] = useState<string>("");
  const [questionsData, setQuestionsData] = useState<any[]>([]);

  // API helper functions
  const createChat = async (
    user_id: string,
    title: string,
    usedModel: string
  ) => {
    const chatTitle = `${title} (${usedModel})`;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, title: chatTitle }),
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
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, user_id, from, content }),
    });
  };

  const getProviderEndpoint = (provider: Provider): string => {
    const endpoints = {
      openai: "/api/chat/openai",
      perplexity: "/api/chat/perplexity",
      deepseek: "/api/chat/deepseek",
      gemini: "/api/chat/gemini",
      anthropic: "/api/chat/anthropic",
      grok: "/api/chat/grok",
    };
    return endpoints[provider];
  };

  const callProvider = async (action: "clarify" | "improve", payload: any) => {
    const endpoint = getProviderEndpoint(provider);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload, model }),
    });
    const data = await response.json();

    // For clarify action, questions now come with their own options
    if (action === "clarify" && data.questions) {
      return { questionsWithOptions: data.questions };
    }

    return data;
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

  // Auto-select model based on provider
  useEffect(() => {
    const modelMap = {
      deepseek: "deepseek-chat",
      openai: "gpt-3.5-turbo",
      perplexity: "sonar-pro",
      gemini: "gemini-2.5-flash-lite-preview-06-17",
      anthropic: "claude-3-5-sonnet-20241022",
      grok: "grok-beta",
    };
    setModel(modelMap[provider]);
  }, [provider]);

  // Chat management functions
  const fetchChatHistory = async (chatId: string) => {
    const res = await fetch(`/api/messages?chat_id=${chatId}`);
    const data = await res.json();
    setMessages(
      data.messages.map((msg: any) => ({
        from: msg.from === "user" ? "user" : "bot",
        text: msg.content,
      }))
    );
  };

  const handleNewSession = () => {
    setMessages([
      { from: "bot", text: "Zadaj pytanie, a pomogę Ci je doprecyzować!" },
    ]);
    setInput("");
    setPhase("init");
    setClarifyingQuestions([]);
    setClarifyingAnswers([]);
    setClarifyingIndex(0);
    setOriginalQuestion("");
    setImprovedPrompt("");
    setChatId(null);
    setSelectedChatId(null);
    setCurrentQuestionOptions([]);
    setCustomAnswer("");
    setQuestionsData([]);
  };

  const handleChatSelect = (chat: any) => {
    setSelectedChatId(chat.id);
    if (chat.id) fetchChatHistory(chat.id);
    setChatId(chat.id);
    setPhase("done"); // Set to done to show history view
  };

  // Main message handling
  const handleSend = async () => {
    if (!input.trim() || isBotResponding) return;

    let currentChatId = chatId;

    // Create new chat if needed
    if (!currentChatId) {
      currentChatId = await createChat(user.id, input, model);
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
      // Remove old clarifying phase handling since we use buttons now
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
      setClarifyingQuestions(questionsWithOptions.map((q: any) => q.question));
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

  const handleOptionSelect = async (selectedAnswer: string) => {
    if (!chatId || isBotResponding) return;

    setIsBotResponding(true);

    // Add user's answer to messages and server
    setMessages((prev) => [...prev, { from: "user", text: selectedAnswer }]);
    await sendMessageToServer(chatId, user.id, "user", selectedAnswer);

    const newAnswers = [...clarifyingAnswers, selectedAnswer];
    setClarifyingAnswers(newAnswers);

    await proceedToNextQuestion(newAnswers);
    setIsBotResponding(false);
  };

  const handleCustomAnswerSubmit = async () => {
    if (!customAnswer.trim() || !chatId || isBotResponding) return;

    setIsBotResponding(true);

    // Add user's custom answer to messages and server
    setMessages((prev) => [...prev, { from: "user", text: customAnswer }]);
    await sendMessageToServer(chatId, user.id, "user", customAnswer);

    const newAnswers = [...clarifyingAnswers, customAnswer];
    setClarifyingAnswers(newAnswers);
    setCustomAnswer("");

    await proceedToNextQuestion(newAnswers);
    setIsBotResponding(false);
  };

  const proceedToNextQuestion = async (newAnswers: string[]) => {
    if (clarifyingIndex + 1 < clarifyingQuestions.length) {
      // Show next question
      const nextIndex = clarifyingIndex + 1;
      const nextQuestion = clarifyingQuestions[nextIndex];

      setClarifyingIndex(nextIndex);

      // Use stored questions data for options
      if (questionsData[nextIndex]) {
        setCurrentQuestionOptions(questionsData[nextIndex].options);
      }

      setMessages((prev) => [...prev, { from: "bot", text: nextQuestion }]);

      if (chatId) {
        await sendMessageToServer(chatId, user.id, "bot", nextQuestion);
      }
    } else {
      // Generate improved prompt
      setPhase("improving");
      const data = await callProvider("improve", {
        question: originalQuestion,
        answers: newAnswers,
      });

      setImprovedPrompt(data.prompt);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "🧠 Ulepszony prompt:" },
        { from: "bot", text: data.prompt },
      ]);

      if (chatId) {
        await sendMessageToServer(
          chatId,
          user.id,
          "bot",
          "🧠 Ulepszony prompt:"
        );
        await sendMessageToServer(chatId, user.id, "bot", data.prompt);
      }

      setPhase("done");
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
                selectedChatId === chat.id ? "bg-gray-700" : ""
              }`}
              onClick={() => handleChatSelect(chat)}
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
            Hello <span className="font-semibold">{user.email}</span>
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
                    onClick={() => handleOptionSelect(option)}
                    className="w-full text-left p-3 bg-gray-600 hover:bg-gray-500 rounded transition-colors disabled:opacity-50"
                    disabled={isBotResponding}
                  >
                    {String.fromCharCode(65 + idx)}. {option}
                  </button>
                ))}

                {/* Custom answer option */}
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <label className="block text-sm font-medium mb-2">
                    D. Lub wpisz swoją odpowiedź:
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={customAnswer}
                      onChange={(e) => setCustomAnswer(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCustomAnswerSubmit()
                      }
                      className="flex-1 px-3 py-2 rounded bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Twoja odpowiedź..."
                      disabled={isBotResponding}
                    />
                    <button
                      onClick={handleCustomAnswerSubmit}
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
        </div>
        {/* Provider and Model Selection */}
        <div className="flex gap-4 p-4 bg-gray-900 border-b border-gray-700">
          <label className="flex items-center gap-2">
            Provider:
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as Provider)}
              className="px-2 py-1 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={phase !== "init"}
            >
              <option value="openai">OpenAI</option>
              <option value="perplexity">Perplexity</option>
              <option value="deepseek">DeepSeek</option>
              <option value="gemini">Gemini</option>
              <option value="anthropic">Anthropic</option>
              <option value="grok">Grok</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            Model:
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="px-2 py-1 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={phase !== "init"}
            >
              {provider === "openai" && (
                <>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                  <option value="gpt-4o">gpt-4o</option>
                </>
              )}
              {provider === "perplexity" && (
                <>
                  <option value="sonar-pro">sonar-pro</option>
                  <option value="sonar">sonar</option>
                </>
              )}
              {provider === "deepseek" && (
                <option value="deepseek-chat">deepseek-chat</option>
              )}
              {provider === "gemini" && (
                <option value="gemini-2.5-flash-lite-preview-06-17">
                  gemini-2.5-flash-lite-preview-06-17
                </option>
              )}
              {provider === "anthropic" && (
                <option value="claude-3-5-sonnet-20241022">
                  claude-3-5-sonnet-20241022
                </option>
              )}
              {provider === "grok" && (
                <option value="grok-beta">grok-beta</option>
              )}
            </select>
          </label>
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
              isBotResponding || phase === "done" || phase === "clarifying"
            }
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isBotResponding ||
              !input.trim() ||
              phase === "done" ||
              phase === "clarifying"
            }
          >
            {isBotResponding ? "Czekaj..." : "Wyślij"}
          </button>
          {phase === "done" && (
            <button
              onClick={handleNewSession}
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
