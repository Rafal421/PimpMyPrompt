import { AuditLogger } from "./audit-logger";

interface SafeAuditDetails {
  messageLength?: number;
  questionLength?: number;
  answersCount?: number;
  [key: string]: string | number | undefined;
}

export async function auditAIRequest(
  provider: string,
  model: string,
  action: string,
  userId?: string,
  details?: SafeAuditDetails
) {
  const auditAction = `AI_REQUEST_${provider.toUpperCase()}`;

  const safeDetails: Record<string, unknown> = {
    provider,
    model,
    action,
  };

  if (details) {
    if (details.messageLength !== undefined) {
      safeDetails.messageLength = details.messageLength;
    }
    if (details.questionLength !== undefined) {
      safeDetails.questionLength = details.questionLength;
    }
    if (details.answersCount !== undefined) {
      safeDetails.answersCount = details.answersCount;
    }
  }

  await AuditLogger.log(auditAction, userId || "anonymous", safeDetails);
}
