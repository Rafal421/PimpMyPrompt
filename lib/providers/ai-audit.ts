import { AuditLogger } from "../audit-logger";

export async function auditAIRequest(
  provider: string,
  model: string,
  action: string,
  userId?: string,
  details?: Record<string, unknown>
) {
  const auditAction = `AI_REQUEST_${provider.toUpperCase()}`;
  const auditDetails = {
    provider,
    model,
    action,
    ...details,
  };

  await AuditLogger.log(auditAction, userId || "anonymous", auditDetails);
}
