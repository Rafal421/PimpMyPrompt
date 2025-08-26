import { useState, useCallback, useEffect } from "react";
import { apiServices } from "@/lib/services/api";
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

  // Wszystkie funkcje API używają teraz services
  const fetchChats = useCallback(async () => {
    const fetchedChats = await apiServices.chats.fetchAll(user.id);
    setChats(fetchedChats);
  }, [user.id]);

  const createChat = useCallback(
    async (title: string, usedModel: string) => {
      const chatId = await apiServices.chats.create(
        user.id,
        `${title} (${usedModel})`
      );
      setChatId(chatId);
      await fetchChats();
      return chatId;
    },
    [user.id, setChatId, fetchChats]
  );

  const sendMessage = useCallback(
    async (chatId: string, from: string, content: string) => {
      await apiServices.messages.send(chatId, user.id, from, content);
    },
    [user.id]
  );

  const fetchChatHistory = useCallback(
    async (chatId: string) => {
      const messages = await apiServices.chats.fetchHistory(chatId);
      setMessages(messages);
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

  const deleteChat = useCallback(
    async (chatIdToDelete: string) => {
      await apiServices.chats.delete(chatIdToDelete, user.id);

      setChats((prev) => prev.filter((chat) => chat.id !== chatIdToDelete));

      if (chatIdToDelete === chatId) {
        onResetSession();
      }

      await fetchChats();
    },
    [user.id, chatId, onResetSession, fetchChats]
  );

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    // State
    chats,

    // Actions
    createChat,
    sendMessage,
    selectChat,
    deleteChat,
    fetchChats,

    // Exposed for useImperativeHandle
    chatSidePanelActions: {
      createChat,
      sendMessage,
      refreshChats: fetchChats,
    },
  };
}
