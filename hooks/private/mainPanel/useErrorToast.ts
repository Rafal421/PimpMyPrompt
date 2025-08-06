import { useState, useCallback } from "react";

interface ErrorState {
  isVisible: boolean;
  message: string;
  details?: string;
}

export function useErrorToast() {
  const [error, setError] = useState<ErrorState>({
    isVisible: false,
    message: "",
    details: undefined,
  });

  const showError = useCallback((message: string, details?: string) => {
    setError({
      isVisible: true,
      message,
      details,
    });
  }, []);

  const hideError = useCallback(() => {
    setError((prev) => ({ ...prev, isVisible: false }));
  }, []);

  const handleApiError = useCallback(
    (error: any, context: string = "API operation") => {
      let message = "Something went wrong";
      let details = "";

      if (error?.message) {
        if (error.message.includes("doesn't contain enough context")) {
          message = "Question Too Vague";
          details =
            "Please provide a more specific question with clear context.";
        } else if (
          error.message.includes("Unable to generate clarifying questions")
        ) {
          message = "Generation Failed";
          details = "Try rephrasing your question with more detail.";
        } else if (error.message.includes("HTTP error! status: 500")) {
          message = "Server Error";
          details = "The server encountered an error. Please try again.";
        } else if (error.message.includes("HTTP error! status: 400")) {
          message = "Invalid Request";
          details = "Please check your input and try again.";
        } else if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("ENOTFOUND")
        ) {
          message = "Connection Error";
          details =
            "Unable to connect to the AI service. Check your internet connection.";
        } else if (error.message.includes("generating final response")) {
          message = "Model Response Failed";
          details = "Try selecting a different model or try again.";
        } else if (error.message.includes("generating improved prompt")) {
          message = "Prompt Generation Failed";
          details = "Try modifying your answers or try again.";
        } else {
          message = "Operation Failed";
          details = error.message;
        }
      }

      showError(message, details);
    },
    [showError]
  );

  return {
    error,
    showError,
    hideError,
    handleApiError,
  };
}
