// lib/services/api/chatService.ts
import type { User, Chat, Message, Provider } from "@/lib/types";

export class ChatService {
  async fetchChats(userId: string): Promise<Chat[]> {
    const res = await fetch(`/api/chat?user_id=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch chats");
    const data = await res.json();
    return data.chats || [];
  }

  async createChat(userId: string, title: string): Promise<string> {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, title }),
    });
    if (!res.ok) throw new Error("Failed to create chat");
    const data = await res.json();
    return data.chat.id;
  }

  async deleteChat(chatId: string, userId: string): Promise<void> {
    const res = await fetch("/api/chat", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, user_id: userId }),
    });
    if (!res.ok) throw new Error("Failed to delete chat");
  }

  async fetchChatHistory(chatId: string): Promise<Message[]> {
    const res = await fetch(`/api/messages?chat_id=${chatId}`);
    if (!res.ok) throw new Error("Failed to fetch chat history");
    const data = await res.json();
    return data.messages.map((msg: { from: string; content: string }) => ({
      from: msg.from === "user" ? "user" : "bot",
      text: msg.content,
    }));
  }

  async getLLMResponse(
    message: string,
    targetProvider: Provider,
    model: string
  ): Promise<string> {
    const endpoint = `/api/chat/${targetProvider}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, model }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.error ||
        `Error from ${targetProvider} API (${response.status})`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return (
      data.response ||
      data.content ||
      data.text ||
      (Array.isArray(data.choices) && data.choices[0]?.message?.content) ||
      (typeof data === "string" ? data : JSON.stringify(data))
    );
  }
}

export const chatService = new ChatService();
