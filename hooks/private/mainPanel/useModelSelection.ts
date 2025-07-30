// hooks/private/mainPanel/useModelSelection.ts
import type { Provider, Message, Phase } from "@/lib/types";
import { chatService } from "@/lib/services/api/chatService";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";

interface ModelSelectionLogicProps {
  improvedPrompt: string;
  chatId: string | null;
  chatSidePanelRef: React.RefObject<ChatSidePanelHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
}

export const createModelSelection = ({
  improvedPrompt,
  chatId,
  chatSidePanelRef,
  setMessages,
  setPhase,
}: ModelSelectionLogicProps) => {
  const handleModelSelect = async (
    selectedProvider: Provider,
    selectedModel: string
  ) => {
    if (!chatId || !improvedPrompt) return;

    const choiceText = `I choose: ${selectedProvider.toUpperCase()} (${selectedModel})`;
    setMessages((prev) => [...prev, { from: "user", text: choiceText }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", choiceText);

    setPhase("final-response");

    try {
      const finalResponse = await chatService.getLLMResponse(
        improvedPrompt,
        selectedProvider,
        selectedModel
      );

      setMessages((prev) => [...prev, { from: "bot", text: finalResponse }]);

      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          finalResponse
        );
      }

      setPhase("done");
    } catch (error) {
      console.error("Error generating final response:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating the final response. Please try again.",
        },
      ]);
      setPhase("model-selection");
    }
  };

  return { handleModelSelect };
};
