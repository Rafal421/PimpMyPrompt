// hooks/private/mainPanel/useModelSelection.ts
import type { Provider, Message, Phase } from "@/lib/types";
import { chatService } from "@/lib/services/api/chatService";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";
import { addTypingMessage } from "@/lib/messageHelpers";

interface ModelSelectionLogicProps {
  improvedPrompt: string;
  chatId: string | null;
  chatSidePanelRef: React.RefObject<ChatSidePanelHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
  onError?: (error: any, context?: string) => void;
  onUsageIncrement?: () => Promise<boolean>; // Add this prop
}

export const createModelSelection = ({
  improvedPrompt,
  chatId,
  chatSidePanelRef,
  setMessages,
  setPhase,
  onError,
  onUsageIncrement,
}: ModelSelectionLogicProps) => {
  const handleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (!chatId || !improvedPrompt) return;

    // Check usage limit before proceeding
    if (onUsageIncrement) {
      const canProceed = await onUsageIncrement();
      if (!canProceed) {
        // Error message for usage limit exceeded
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: "You've reached your hourly limit of 20 requests. Please wait for the next hour or upgrade your plan.",
          },
        ]);
        return;
      }
    }

    // User selects model and provider
    const choiceText = `I choose: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    setMessages((prev) => [
      ...prev,
      { from: "user", text: choiceText, isTyping: false },
    ]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", choiceText);

    // Transition to final response phase
    setPhase("final-response");

    try {
      const finalResponse = await chatService.getLLMResponse(
        improvedPrompt,
        selectedProvider,
        selectedModel
      );

      // Typing animation for bot's final response
      addTypingMessage(setMessages, finalResponse, () => {
        setTimeout(() => {
          setPhase("done");
        }, 500);
      });

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          finalResponse
        );
      }
    } catch (error) {
      onError?.(error, "generating final response");

      // Error message for final response generation
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem while generating the final response. Please try selecting a different model or try again.",
        },
      ]);
    }
  };

  return { handleModelSelect };
};
