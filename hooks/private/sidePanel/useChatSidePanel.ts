import { useState, useCallback, useEffect } from "react";
import type { User, Chat, Message, Phase } from "@/lib/types";

interface UseChatSidePanelProps {
  user: User;
  chatId: string | null;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
  onResetSession: () => void;
  onChatCreated?: (chatId: string) => void;
}

export function useChatSidePanel({
  user,
  chatId,
  setChatId,
  setMessages,
  setPhase,
  onResetSession,
  onChatCreated,
}: UseChatSidePanelProps) {
  const [chats, setChats] = useState<Chat[]>([]);

  // Fetch all chats for user
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`/api/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, []);

  // Create new chat
  const createChat = useCallback(
    async (
      title: string,
      usedModel: string,
      chatMode?: "PMP" | "CHAT" | "COMPARE"
    ) => {
      try {
        const res = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            mode: chatMode || "PMP",
          }),
        });
        if (!res.ok) throw new Error("Failed to create chat");
        const data = await res.json();
        const newChatId = data.chat.id;
        setChatId(newChatId);
        await fetchChats();
        return newChatId;
      } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
      }
    },
    [setChatId, fetchChats]
  );

  // Send message
  const sendMessage = useCallback(
    async (chatId: string, from: string, content: string) => {
      try {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            from,
            content,
          }),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    []
  );

  // Fetch chat history
  const fetchChatHistory = useCallback(
    async (chatId: string) => {
      try {
        const chatRes = await fetch(`/api/chats`);
        const chatData = await chatRes.json();
        const currentChat = chatData.chats?.find((c: any) => c.id === chatId);

        const apiUrl =
          currentChat?.mode === "COMPARE"
            ? `/api/modes/compare/messages?chat_id=${chatId}`
            : `/api/messages?chat_id=${chatId}`;

        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();

        const messages = data.messages.map(
          (msg: {
            from: string;
            content?: string;
            text?: string;
            compareResponses?: any;
            summary?: string;
          }) => ({
            from: msg.from === "user" ? "user" : "bot",
            text: msg.content || msg.text || "",
            compareResponses: msg.compareResponses,
            summary: msg.summary,
          })
        );
        setMessages(messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    },
    [setMessages]
  );

  const selectChat = useCallback(
    (chat: Chat) => {
      if (chat.id) {
        fetchChatHistory(chat.id);
        setChatId(chat.id);
        setPhase("done");
      }
    },
    [fetchChatHistory, setChatId, setPhase]
  );

  // Delete chat
  const deleteChat = useCallback(
    async (chatIdToDelete: string) => {
      try {
        await fetch("/api/chats", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatIdToDelete }),
        });

        setChats((prev) => prev.filter((chat) => chat.id !== chatIdToDelete));

        if (chatIdToDelete === chatId) {
          onResetSession();
        }

        await fetchChats();
      } catch (error) {
        console.error("Error deleting chat:", error);
        throw error;
      }
    },
    [chatId, onResetSession, fetchChats]
  );

  // Update chat title
  const updateChatTitle = useCallback(
    async (chatId: string, newTitle: string) => {
      try {
        await fetch("/api/chats", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            title: newTitle,
          }),
        });

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, title: newTitle } : chat
          )
        );

        await fetchChats();
      } catch (error) {
        console.error("Failed to update chat title:", error);
        throw error;
      }
    },
    [fetchChats]
  );

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const currentChat = chats.find((chat) => chat.id === chatId);

  return {
    // State
    chats,
    currentChat,

    // Actions
    createChat,
    sendMessage,
    selectChat,
    deleteChat,
    updateChatTitle,
    fetchChats,

    // Exposed for useImperativeHandle
    chatSidePanelActions: {
      createChat,
      sendMessage,
      refreshChats: fetchChats,
      updateChatTitle,
    },
  };
}
