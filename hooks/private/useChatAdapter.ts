"use client";
import { usePMPChat, type PMPChatConfig } from "./modes/usePMPChat";
import { useSimpleChat, type SimpleChatConfig } from "./modes/useSimpleChat";
import { useCompareChat, type CompareChatConfig } from "./modes/useCompareChat";

export type ChatMode = "pmp" | "simple" | "compare";

type ChatConfig = PMPChatConfig | SimpleChatConfig | CompareChatConfig;

/**
 * useChatAdapter - Routes to appropriate chat mode hook
 * Selects and returns the correct chat hook based on the current mode
 */
export function useChatAdapter(mode: ChatMode, config: ChatConfig) {
  switch (mode) {
    case "pmp":
      return usePMPChat(config as PMPChatConfig);

    case "simple":
      return useSimpleChat(config as SimpleChatConfig);

    case "compare":
      return useCompareChat(config as CompareChatConfig);

    default:
      throw new Error(`Unknown chat mode: ${mode}`);
  }
}
