export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_CONFIRMED: "Please check your email and confirm your account",
  USER_EXISTS: "User with this email already exists",
  WEAK_PASSWORD: "Password is too weak",
  INVALID_EMAIL: "Invalid email format",
  SERVER_ERROR: "Server error occurred. Please try again.",
  RATE_LIMIT: "Too many attempts. Please try again later.",
} as const;

export const mapSupabaseError = (error: unknown): string => {
  const message = (error as { message?: string })?.message?.toLowerCase() || "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  ) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }
  if (message.includes("email not confirmed")) {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }
  if (
    message.includes("user already registered") ||
    message.includes("already exists")
  ) {
    return ERROR_MESSAGES.USER_EXISTS;
  }
  if (message.includes("password should be")) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  if (message.includes("invalid email")) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  if ((error as { status?: number })?.status === 429) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};
