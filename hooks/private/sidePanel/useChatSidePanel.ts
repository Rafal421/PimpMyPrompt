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
      const res = await fetch(`/api/chats?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  }, [user.id]);

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
            user_id: user.id,
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
    [user.id, setChatId, fetchChats]
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
            user_id: user.id,
            from,
            content,
          }),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [user.id]
  );

  // Fetch chat history
  const fetchChatHistory = useCallback(
    async (chatId: string) => {
      try {
        const res = await fetch(`/api/messages?chat_id=${chatId}`);
        if (!res.ok) throw new Error("Failed to fetch chat history");
        const data = await res.json();
        const messages = data.messages.map(
          (msg: { from: string; content: string }) => ({
            from: msg.from === "user" ? "user" : "bot",
            text: msg.content,
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
          body: JSON.stringify({ chat_id: chatIdToDelete, user_id: user.id }),
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
    [user.id, chatId, onResetSession, fetchChats]
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
            user_id: user.id,
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
    [user.id, fetchChats]
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
