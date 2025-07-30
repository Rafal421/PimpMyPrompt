// hooks/private/mainPanel/useQuestionFlow.ts
import type { Message, Phase, QuestionData, Provider } from "@/lib/types";
import { useQuestionGenerator } from "@/hooks/private/sidePanel/useQuestionGenerator";
import { ChatSidePanelHandle } from "@/components/private/ChatSidePanel";

interface QuestionFlowLogicProps {
  provider: Provider;
  chatId: string | null;
  chatSidePanelRef: React.RefObject<ChatSidePanelHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setPhase: React.Dispatch<React.SetStateAction<Phase>>;
  generateImprovedPrompt: () => Promise<void>;
  setOriginalQuestion: React.Dispatch<React.SetStateAction<string>>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setQuestionsData: React.Dispatch<React.SetStateAction<QuestionData[]>>;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  setClarifyingAnswers: React.Dispatch<React.SetStateAction<string[]>>;
  setCustomAnswer: React.Dispatch<React.SetStateAction<string>>;
  clarifyingAnswers: string[];
  questionsData: QuestionData[];
  currentQuestionIndex: number;
}

export const createQuestionFlow = ({
  provider,
  chatId,
  chatSidePanelRef,
  setMessages,
  setPhase,
  generateImprovedPrompt,
  setOriginalQuestion,
  setInput,
  setQuestionsData,
  setCurrentQuestionIndex,
  setClarifyingAnswers,
  setCustomAnswer,
  clarifyingAnswers,
  questionsData,
  currentQuestionIndex,
}: QuestionFlowLogicProps) => {
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getProviderEndpoint: (p: string) => `/api/chat/${p}`,
  });

  const startQuestionFlow = async (
    question: string,
    currentChatId: string | null
  ) => {
    setOriginalQuestion(question);
    setInput("");

    try {
      const questionsWithOptions = await generateClarifyingQuestions(question);

      if (questionsWithOptions.length > 0) {
        setQuestionsData(questionsWithOptions);
        setPhase("clarifying");
        setCurrentQuestionIndex(0);
        setClarifyingAnswers([]);

        const firstQuestion = questionsWithOptions[0].question;
        setMessages((prev) => [...prev, { from: "bot", text: firstQuestion }]);
        if (currentChatId) {
          await chatSidePanelRef.current?.sendMessage(
            currentChatId,
            "bot",
            firstQuestion
          );
        }
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "An error occurred while generating clarifying questions. Please try again.",
        },
      ]);
    }
  };

  const proceedToNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questionsData.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionsData[nextIndex].question;

      setMessages((prev) => [...prev, { from: "bot", text: nextQuestion }]);
      if (chatId) {
        await chatSidePanelRef.current?.sendMessage(
          chatId,
          "bot",
          nextQuestion
        );
      }
    } else {
      await generateImprovedPrompt();
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    if (!chatId || !answer.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: answer }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", answer);

    const newAnswers = [...clarifyingAnswers, answer];
    setClarifyingAnswers(newAnswers);
    setCustomAnswer("");
    await proceedToNextQuestion();
  };

  return { startQuestionFlow, handleAnswerSubmit };
};
