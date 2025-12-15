"use client";
import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Edit3 } from "lucide-react";
import { Background } from "@/components/ui/background";
import ModeToggle from "./ModeToggle";
import type { ChatMode } from "@/hooks/private/useChatAdapter";

interface ChatLayoutProps {
  sidebar: ReactNode;
  header?: {
    title: string;
    onTitleEdit?: (newTitle: string) => void;
    canEditTitle?: boolean;
    providerInfo?: string;
    mode?: string;
  };
  children: ReactNode;
}

/**
 * ChatLayout - Pure layout component for chat interface
 * Handles sidebar, header, responsiveness without business logic
 */
export default function ChatLayout({
  sidebar,
  header,
  children,
}: ChatLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(header?.title || "");

  // Responsiveness
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** handleTitleClick - Initiates title editing mode */
  const handleTitleClick = () => {
    if (header?.onTitleEdit && header?.canEditTitle) {
      setIsEditingTitle(true);
      setEditTitle(header.title);
    }
  };

  /** handleTitleSave - Saves the edited title */
  const handleTitleSave = async () => {
    if (!editTitle.trim() || editTitle.trim() === header?.title) {
      setIsEditingTitle(false);
      return;
    }
    header?.onTitleEdit?.(editTitle.trim());
    setIsEditingTitle(false);
  };

  /** handleTitleCancel - Cancels title editing without saving */
  const handleTitleCancel = () => {
    setIsEditingTitle(false);
    setEditTitle(header?.title || "");
  };

  /** handleTitleKeyDown - Handles keyboard shortcuts for title editing */
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleTitleSave();
    else if (e.key === "Escape") handleTitleCancel();
  };

  return (
    <div className="flex h-[100svh] bg-black overflow-hidden">
      <Background />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isDesktop ? 0 : isSidebarOpen ? 0 : "-100%",
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0.0, 0.2, 1],
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="fixed lg:relative inset-y-0 left-0 z-50 lg:z-10 lg:!translate-x-0 lg:block"
      >
        {sidebar}
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col bg-black/20 backdrop-blur-sm max-h-[100svh]">
        {/* Header */}
        <div className="bg-black/40 backdrop-blur-md border-b border-gray-800/50 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 text-white hover:bg-white/10 rounded-lg"
            >
              <div className="relative w-5 h-5">
                <Menu
                  className={`absolute inset-0 w-5 h-5 transition-opacity ${
                    isSidebarOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <X
                  className={`absolute inset-0 w-5 h-5 transition-opacity ${
                    isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            </button>

            {/* Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
              {header ? (
                <div className="flex items-center gap-2">
                  {isEditingTitle ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={handleTitleKeyDown}
                      onBlur={handleTitleSave}
                      className="bg-gray-800/50 text-white text-base font-semibold px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none max-w-48"
                      autoFocus
                    />
                  ) : (
                    <>
                      <button
                        onClick={handleTitleClick}
                        disabled={!header.canEditTitle}
                        className="text-base font-semibold text-white hover:text-blue-300 transition-colors truncate max-w-48 text-center disabled:cursor-not-allowed disabled:hover:text-white"
                        title={header.canEditTitle ? "Click to edit" : ""}
                      >
                        {header.title}
                      </button>
                      {header.canEditTitle && (
                        <div
                          className="cursor-pointer"
                          onClick={handleTitleClick}
                          title="Edit chat name"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400 hover:text-blue-300 transition-colors opacity-60" />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-base font-semibold text-gray-400">
                  New Chat
                </div>
              )}
            </div>

            {/* Mode Selector & Provider Info */}
            <div className="flex items-center gap-2 ml-auto">
              {header?.mode && (
                <ModeToggle
                  currentMode={header.mode as ChatMode}
                  onModeChange={(mode) => {
                    window.location.href = `/private?mode=${mode}`;
                  }}
                />
              )}
              {header?.providerInfo && (
                <div className="hidden sm:block text-xs text-gray-400 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-700/50 font-mono">
                  {header.providerInfo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content (messages + input) */}
        {children}
      </div>
    </div>
  );
}
