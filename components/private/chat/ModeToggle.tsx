"use client";
import { ChatMode } from "@/hooks/private/useChatAdapter";
import { Zap, MessageSquare, GitCompare } from "lucide-react";

interface ModeToggleProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled?: boolean;
}

const modes = [
  {
    id: "pmp" as ChatMode,
    label: "PMP",
    icon: Zap,
    description: "Prompt improvement flow",
  },
  {
    id: "simple" as ChatMode,
    label: "Chat",
    icon: MessageSquare,
    description: "Simple conversation",
  },
  {
    id: "compare" as ChatMode,
    label: "Compare",
    icon: GitCompare,
    description: "Compare AI models",
  },
];

/**
 * ModeToggle - Chat mode selector component
 * Allows switching between PMP, Simple, and Compare modes
 */
export default function ModeToggle({
  currentMode,
  onModeChange,
  disabled = false,
}: ModeToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-900/50 backdrop-blur-sm rounded-full p-1 border border-gray-700/50">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => {
              onModeChange(mode.id);
            }}
            disabled={disabled}
            title={mode.description}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
