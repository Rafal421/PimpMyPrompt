// hooks/private/mainPanel/usePromptImprover.ts
import type { Provider, Message, Phase } from "@/lib/types";
import { getQuestionProviderById } from "@/lib/ai-config";
import { createImprovePrompt } from "@/lib/ai-helpers";
import { chatService } from "@/lib/services/api/chatService";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";
import { addTypingMessage } from "@/lib/messageHelpers";

const DEFAULT_MODEL = "claude-3-5-sonnet-20241022";

interface PromptImproverLogicProps {
  originalQuestion: string;
  clarifyingAnswers: string[];
  provider: Provider;
  chatId: string | null;
  chatSidePanelRef: React.RefObject<ChatSidePanelHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
  setImprovedPrompt: React.Dispatch<React.SetStateAction<string>>;
  setIsBotResponding: React.Dispatch<React.SetStateAction<boolean>>;
  onError?: (error: any, context?: string) => void;
}

export const createPromptImprover = ({
  originalQuestion,
  clarifyingAnswers,
  provider,
  chatId,
  chatSidePanelRef,
  setMessages,
  setPhase,
  setImprovedPrompt,
  setIsBotResponding,
  onError,
}: PromptImproverLogicProps) => {
  const generateImprovedPrompt = async () => {
    if (!chatId) return;

    setPhase("improving");
    setIsBotResponding(true); // Set loading when actually starting to generate

    const questionProvider = getQuestionProviderById(provider);
    const currentModel = questionProvider?.model || DEFAULT_MODEL;
    const improvePromptContent = createImprovePrompt(
      originalQuestion,
      clarifyingAnswers
    );

    try {
      const prompt = await chatService.getLLMResponse(
        improvePromptContent,
        provider,
        currentModel
      );

      setImprovedPrompt(prompt);

      // Typing animation for improved prompt
      addTypingMessage(setMessages, prompt, () => {
        // Turn off loading after typing animation completes
        setIsBotResponding(false);
        setTimeout(() => {
          setPhase("model-selection");
        }, 500);
      });

      if (chatId) {
        // Send improved prompt to chat
        await chatSidePanelRef.current?.sendMessage(chatId, "bot", prompt);
      }
    } catch (error) {
      setIsBotResponding(false); // Turn off loading on error
      onError?.(error, "generating improved prompt");

      // Error message for improved prompt generation
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem while generating the improved prompt. Please try again or modify your answers.",
        },
      ]);
      // Stay in current phase, don't go back to clarifying
    }
  };

  return { generateImprovedPrompt };
};
