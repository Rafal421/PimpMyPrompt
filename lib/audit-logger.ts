export class AuditLogger {
  static async log(
    action: string,
    userId: string,
    details?: Record<string, unknown>
  ) {
    try {
      const timestamp = new Date().toISOString();
      const sanitizedDetails = details ? this.sanitize(details) : {};

      console.log(
        `[AUDIT] ${timestamp} - ${action} - User: ${userId}`,
        sanitizedDetails
      );
    } catch {
      console.error(`[AUDIT_ERROR] Failed to log action: ${action}`);
    }
  }

  private static sanitize(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized = { ...data };
    const sensitiveFields = [
      "password",
      "email",
      "first_name",
      "last_name",
      "date_of_birth",
      "ssn",
      "phone",
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}
