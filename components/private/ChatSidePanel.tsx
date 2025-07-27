"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { logout } from "@/app/login/actions";
import type { User, Chat, Message, Phase } from "@/lib/types";
import {
  Plus,
  MessageSquare,
  LogOut,
  UserIcon,
  Bot,
  ArrowRight,
  Trash2,
} from "lucide-react";

export interface ChatSidePanelHandle {
  createChat: (title: string, usedModel: string) => Promise<string | null>;
  sendMessage: (
    chat_id: string,
    from: string,
    content: string
  ) => Promise<void>;
  refreshChats: () => Promise<void>;
}

interface ChatSidePanelProps {
  user: User;
  chatId: string | null;
  setChatId: React.Dispatch<React.SetStateAction<string | null>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
  onResetSession: () => void;
  onChatCreated?: (chatId: string) => void;
  onCreateChat?: (title: string, usedModel: string) => Promise<string | null>;
  onSendMessage?: (
    chat_id: string,
    from: string,
    content: string
  ) => Promise<void>;
}

const ChatSidePanel = forwardRef<ChatSidePanelHandle, ChatSidePanelProps>(
  (
    {
      user,
      chatId,
      setChatId,
      setMessages,
      setPhase,
      onResetSession,
      onChatCreated,
      onCreateChat,
      onSendMessage,
    },
    ref
  ) => {
    const [chats, setChats] = useState<Chat[]>([]);

    const fetchChats = useCallback(async () => {
      try {
        const res = await fetch(`/api/chat?user_id=${user.id}`);
        const data = await res.json();
        setChats(data.chats || []);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }, [user.id]);

    // Fetch chats on component mount
    useEffect(() => {
      fetchChats();
    }, [fetchChats]);

    // API helper functions - przeniesione z ChatClient
    const createChat = async (
      user_id: string,
      title: string,
      usedModel: string
    ) => {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, title: `${title} (${usedModel})` }),
        });
        const data = await res.json();
        return data.chat.id;
      } catch (error) {
        console.error("Error creating chat:", error);
        return null;
      }
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
            onResetSession();
          }

          // Refresh chats list
          fetchChats();
        } else {
          console.error("Failed to delete chat");
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    };

    // Expose functions for parent component
    const handleCreateChat = async (title: string, usedModel: string) => {
      // Use passed function or internal one
      const newChatId = onCreateChat
        ? await onCreateChat(title, usedModel)
        : await createChat(user.id, title, usedModel);

      if (newChatId) {
        setChatId(newChatId);
        fetchChats(); // Refresh chat list
        if (onChatCreated) {
          onChatCreated(newChatId);
        }
      }
      return newChatId;
    };

    const handleSendMessage = async (
      chat_id: string,
      from: string,
      content: string
    ) => {
      // Use passed function or internal one
      return onSendMessage
        ? onSendMessage(chat_id, from, content)
        : sendMessageToServer(chat_id, user.id, from, content);
    };

    // Expose functions to parent component
    useImperativeHandle(
      ref,
      () => ({
        createChat: handleCreateChat,
        sendMessage: handleSendMessage,
        refreshChats: fetchChats,
      }),
      [handleCreateChat, handleSendMessage, fetchChats]
    );

    return (
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
            onClick={onResetSession}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 group shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            New Chat
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Recent Chats
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
                      title="Delete chat"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:hidden transition-all duration-200" />
                      <Trash2 className="w-4 h-4 text-red-400 hidden group-hover:block transition-all duration-200" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate leading-5">
                        {chat.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5">
                        Last conversation
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
    );
  }
);

ChatSidePanel.displayName = "ChatSidePanel";

export default ChatSidePanel;
