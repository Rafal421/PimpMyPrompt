// hooks/private/mainPanel/PMP/hooks/questionFlowFactory.ts
import type { Message, Phase, QuestionData, Provider } from "@/lib/types";
import { useQuestionGenerator } from "./useQuestionGenerator";
import { ChatSidePanelHandle } from "@/components/private/chat/ChatSidePanel";
import { addTypingMessage } from "@/lib/messageHelpers";

interface QuestionFlowLogicProps {
  provider: Provider;
  chatId: string | null;
  chatSidePanelRef: React.RefObject<ChatSidePanelHandle | null>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  phase: Phase;
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
  setIsBotResponding: React.Dispatch<React.SetStateAction<boolean>>;
  onError?: (error: unknown, context?: string) => void;
}

export const createQuestionFlow = ({
  provider,
  chatId,
  chatSidePanelRef,
  setMessages,
  phase,
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
  setIsBotResponding,
  onError,
}: QuestionFlowLogicProps) => {
  const { generateClarifyingQuestions } = useQuestionGenerator({
    provider,
    getProviderEndpoint: (p: string) => `/api/providers/${p}`,
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
        setCurrentQuestionIndex(0);
        setClarifyingAnswers([]);

        const firstQuestion = questionsWithOptions[0].question;

        // Add typing animation for first question with delay to show it after user message
        setTimeout(() => {
          addTypingMessage(
            setMessages,
            firstQuestion,
            () => {
              setTimeout(() => {
                setPhase("clarifying");
              }, 300);
            },
            () => {
              // Turn off loading when typing animation starts
              setIsBotResponding(false);
            }
          );
        }, 500);

        if (currentChatId) {
          await chatSidePanelRef.current?.sendMessage(
            currentChatId,
            "bot",
            firstQuestion
          );
        }
      }
    } catch (error) {
      onError?.(error, "generating clarifying questions");

      // Add error message to chat instead of breaking the flow
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "I encountered a problem while generating clarifying questions. Please try rephrasing your question or try again.",
        },
      ]);
      // Stay in current phase, let user try again
    }
  };

  const proceedToNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questionsData.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionsData[nextIndex].question;

      // Add typing animation for next question
      addTypingMessage(
        setMessages,
        nextQuestion,
        () => {
          setTimeout(() => {
            setPhase("clarifying");
          }, 300);
        },
        () => {
          // Turn off loading when typing animation starts
          setIsBotResponding(false);
        }
      );

      // Send next question to chat
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

    if (phase === "improving") return;

    setPhase("improving");

    // Add user answer to chat
    setMessages((prev) => [...prev, { from: "user", text: answer }]);
    await chatSidePanelRef.current?.sendMessage(chatId, "user", answer);

    const newAnswers = [...clarifyingAnswers, answer];
    setClarifyingAnswers(newAnswers);
    setCustomAnswer("");

    setTimeout(() => {
      proceedToNextQuestion();
    }, 1600);
  };

  return { startQuestionFlow, handleAnswerSubmit };
};
