// hooks/private/mainPanel/usePromptImprover.ts
import type { Provider, Message, Phase } from "@/lib/types";
import { getQuestionProviderById } from "@/lib/ai-config";
import { createImprovePrompt } from "@/lib/ai-helpers";
import { chatService } from "@/lib/services/api/chatService";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";

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
  onError,
}: PromptImproverLogicProps) => {
  const generateImprovedPrompt = async () => {
    if (!chatId) return;

    setPhase("improving");

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
      setMessages((prev) => [...prev, { from: "bot", text: prompt }]);

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(chatId, "bot", prompt);
      }

      setPhase("model-selection");
    } catch (error) {
      onError?.(error, "generating improved prompt");

      // Add error message to chat instead of going back to clarifying phase
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
