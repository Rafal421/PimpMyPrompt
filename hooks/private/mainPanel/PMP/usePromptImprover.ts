// hooks/private/mainPanel/usePromptImprover.ts
import type { Provider, Message, Phase } from "@/lib/types";
import { getQuestionProviderById } from "@/lib/ai-config";
import { createImprovePrompt } from "@/lib/ai-helpers";
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
      // Call provider directly for improve action instead of using getLLMResponse
      const response = await fetch(`/api/providers/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "improve",
          question: originalQuestion,
          answers: clarifyingAnswers,
          model: currentModel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to generate improved prompt"
        );
      }

      const data = await response.json();
      const prompt =
        data.response ||
        data.content ||
        data.prompt ||
        "Failed to generate prompt";

      setImprovedPrompt(prompt);

      addTypingMessage(setMessages, prompt, () => {
        setTimeout(() => {
          setPhase("model-selection");
        }, 500);
      });

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(chatId, "bot", prompt);
      }
      setIsBotResponding(false);
    } catch (error) {
      setIsBotResponding(false);
      onError?.(error, "generating improved prompt");

      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem while generating the improved prompt. Please try again or modify your answers.",
        },
      ]);
    }
  };

  return { generateImprovedPrompt };
};
