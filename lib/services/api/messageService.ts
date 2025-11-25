import { AuditLogger } from "@/lib/audit-logger";

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
    
    await AuditLogger.log("MESSAGE_SENT", userId, { chat_id: chatId, from, content_length: content.length });
  }
}

export const messageService = new MessageService();
