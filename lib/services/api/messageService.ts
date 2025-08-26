export class MessageService {
  async sendMessage(
    chatId: string,
    userId: string,
    from: string,
    content: string
  ): Promise<void> {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, user_id: userId, from, content }),
    });
    if (!res.ok) throw new Error("Failed to send message");
  }
}

export const messageService = new MessageService();
