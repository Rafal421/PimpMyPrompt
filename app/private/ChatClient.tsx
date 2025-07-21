"use client";
import React, { useState, useEffect } from "react";
import { logout } from "@/app/login/actions";

const createChat = async (user_id: string, title: string) => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id, title }),
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

export default function ChatClient({ user }: { user: any }) {
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Cześć, jak mogę Ci pomóc?" },
  ]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [provider, setProvider] = useState<"openai" | "perplexity">("openai");
  const [model, setModel] = useState<string>("gpt-3.5-turbo");

  const sendMessageToLLM = async (message: string) => {
    const endpoint =
      provider === "openai" ? "/api/chat/openai" : "/api/chat/perplexity";

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model }),
    });

    const data = await response.json();
    return data.response;
  };
  useEffect(() => {
    const fetchChats = async () => {
      const res = await fetch(`/api/chat?user_id=${user.id}`);
      const data = await res.json();
      setChats(data.chats || []);
    };
    fetchChats();
  }, [user.id]);

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
  const handleSend = async () => {
    if (input.trim() && !isBotResponding) {
      let currentChatId = chatId;

      if (!currentChatId) {
        currentChatId = await createChat(user.id, "Nowa rozmowa");
        setChatId(currentChatId);
      }

      setMessages((prev) => [...prev, { from: "user", text: input }]);
      const userMessage = input;
      setInput("");
      setIsBotResponding(true);

      await sendMessageToServer(
        currentChatId as string,
        user.id,
        "user",
        userMessage
      );

      const gptResponse = await sendMessageToLLM(userMessage);

      setMessages((prev) => [...prev, { from: "bot", text: gptResponse }]);

      await sendMessageToServer(
        currentChatId as string,
        user.id,
        "bot",
        gptResponse
      );

      setIsBotResponding(false);
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
              className={`hover:bg-gray-800 rounded px-2 py-1 cursor-pointer ${
                selectedChatId === chat.id ? "bg-gray-700" : ""
              }`}
              onClick={() => {
                setSelectedChatId(chat.id);
                fetchChatHistory(chat.id);
                setChatId(chat.id);
              }}
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
        </div>
        {/* Input */}
        <div className="flex gap-4 p-4 bg-gray-900 border-b border-gray-700">
          <label>
            Provider:
            <select
              value={provider}
              onChange={(e) =>
                setProvider(e.target.value as "openai" | "perplexity")
              }
              className="ml-2 px-2 py-1 rounded bg-gray-700 text-white"
            >
              <option value="openai">OpenAI</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </label>
          <label>
            Model:
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="ml-2 px-2 py-1 rounded bg-gray-700 text-white"
            >
              {provider === "openai" ? (
                <>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  <option value="gpt-4">gpt-4</option>
                </>
              ) : (
                <>
                  <option value="sonar-pro">sonar-pro</option>
                  <option value="sonar">sonar</option>
                </>
              )}
            </select>
          </label>
        </div>
        <div className="p-4 border-t border-gray-700 flex items-center bg-gray-900">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 mr-2 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Napisz wiadomość..."
            disabled={isBotResponding}
          />
          <button
            onClick={handleSend}
            className="bg-white hover:bg-blue-700 text-black px-4 py-2 rounded"
            disabled={isBotResponding}
          >
            {isBotResponding ? "Czekaj..." : "Wyślij"}
          </button>
        </div>
      </div>
    </div>
  );
}
