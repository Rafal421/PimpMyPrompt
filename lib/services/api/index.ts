import { questionService } from "./questionService";
import { chatService } from "./chatService";
import { messageService } from "./messageService";

// Centralne error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`API Error in ${context}:`, error);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(`Operation failed: ${context}`, undefined, context);
  }
}

// Eksportuj wszystkie serwisy z error handling
export const apiServices = {
  questions: {
    generateClarifying: (question: string, provider: any) =>
      withErrorHandling(
        () => questionService.generateClarifyingQuestions(question, provider),
        "generateClarifyingQuestions"
      ),
  },

  chats: {
    fetchAll: (userId: string) =>
      withErrorHandling(() => chatService.fetchChats(userId), "fetchChats"),
    create: (userId: string, title: string) =>
      withErrorHandling(
        () => chatService.createChat(userId, title),
        "createChat"
      ),
    delete: (chatId: string, userId: string) =>
      withErrorHandling(
        () => chatService.deleteChat(chatId, userId),
        "deleteChat"
      ),
    fetchHistory: (chatId: string) =>
      withErrorHandling(
        () => chatService.fetchChatHistory(chatId),
        "fetchHistory"
      ),
  },

  messages: {
    send: (chatId: string, userId: string, from: string, content: string) =>
      withErrorHandling(
        () => messageService.sendMessage(chatId, userId, from, content),
        "sendMessage"
      ),
  },
};

export { ApiError };
export type { QuestionData, Chat, Message } from "@/lib/types";
