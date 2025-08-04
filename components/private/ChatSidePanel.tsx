"use client";
import React, { forwardRef, useImperativeHandle } from "react";
import { logout } from "@/app/login/actions";
import { useChatSidePanel } from "@/hooks/private/sidePanel/useChatSidePanel";
import type { User, Message, Phase } from "@/lib/types";
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
  isBotResponding: boolean;
  onChatCreated?: (chatId: string) => void;
}

const ChatSidePanel = forwardRef<ChatSidePanelHandle, ChatSidePanelProps>(
  (props, ref) => {
    const { chats, selectChat, deleteChat, chatSidePanelActions } =
      useChatSidePanel(props);

    // Expose functions to parent component
    useImperativeHandle(ref, () => chatSidePanelActions, [
      chatSidePanelActions,
    ]);

    const handleDeleteChat = (chatIdToDelete: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (props.isBotResponding) return;
      deleteChat(chatIdToDelete);
    };

    return (
      <div className="relative z-10 w-72 h-full bg-black/40 backdrop-blur-md border-r border-gray-800/50 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Assistant</h2>
              <p className="text-gray-400 text-sm">Prompt Enhancement</p>
            </div>
          </div>

          <button
            onClick={props.onResetSession}
            disabled={props.isBotResponding}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold group shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Plus className="w-5 h-5" />
            New Chat
            <ArrowRight className="w-4 h-4 ml-auto" />
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
                className={`relative group w-full rounded-xl border ${
                  props.chatId === chat.id
                    ? "bg-gray-800/50 border-gray-700/50 shadow-lg"
                    : "bg-black/20 border-gray-800/30 hover:bg-gray-800/30 hover:border-gray-700/50 hover:shadow-md"
                }`}
              >
                <div
                  className="w-full text-left p-4 rounded-xl cursor-pointer"
                  onClick={() => !props.isBotResponding && selectChat(chat)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0 hover:bg-red-500/20 hover:border-red-500/50 disabled:bg-gray-600/20 disabled:border-gray-700/50 disabled:cursor-not-allowed"
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      title="Delete chat"
                      disabled={props.isBotResponding}
                    >
                      <MessageSquare className="w-4 h-4 text-gray-400 group-hover:hidden" />
                      <Trash2 className="w-4 h-4 text-red-400 hidden group-hover:block" />
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {props.user.email || "User"}
                </p>
                <p className="text-xs text-gray-400">Online</p>
              </div>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg"
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
