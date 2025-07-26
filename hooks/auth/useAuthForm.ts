// hooks/useAuthForm.ts - Custom hook for auth form state
import { useState, useCallback, useMemo } from "react";
import {
  validateEmailReal,
  validatePassword,
  type ActionResult,
} from "@/lib/validation";

export function useAuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");

  // Memoized computed values
  const passwordMatch = useMemo(
    () =>
      password === confirmPassword &&
      password.length > 0 &&
      confirmPassword.length > 0,
    [password, confirmPassword]
  );

  const passwordStrength = useMemo(
    () => validatePassword(password),
    [password]
  );

  // Real-time validation
  const validateField = useCallback(
    (field: string, value: string) => {
      let error = "";

      switch (field) {
        case "email":
          error = validateEmailReal(value) || "";
          break;
        case "password":
          // Nie pokazuj błędu walidacji hasła - tylko dla pustego pola
          if (mode === "signup" && value.length === 0) {
            error = "Hasło jest wymagane";
          } else if (mode === "login" && value.length === 0) {
            error = "Hasło jest wymagane";
          }
          break;
        case "confirmPassword":
          if (mode === "signup" && value && value !== password) {
            error = "Hasła nie są identyczne";
          }
          break;
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field]; // Usuń puste błędy
        }
        return newErrors;
      });
    },
    [mode, password]
  );

  const clearErrors = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  const resetForm = useCallback(() => {
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    clearErrors();
  }, [clearErrors]);

  const switchMode = useCallback(
    (newMode: "login" | "signup") => {
      setMode(newMode);
      resetForm();
    },
    [resetForm]
  );

  const handleServerResponse = useCallback((result: ActionResult | void) => {
    if (result?.fieldErrors) {
      const errors: Record<string, string> = {};
      result.fieldErrors.forEach(({ field, message }) => {
        errors[field] = message;
      });
      setValidationErrors(errors);
    } else if (result?.error) {
      setError(result.error);
    }
    setIsLoading(false);
  }, []);

  const isFormValid = useMemo(() => {
    if (mode === "login") {
      return (
        email.length > 0 &&
        password.length > 0 &&
        !validateEmailReal(email) &&
        Object.keys(validationErrors).filter((key) => validationErrors[key])
          .length === 0
      );
    }

    // Dla signup - wszystkie pola muszą być wypełnione i prawidłowe
    return (
      email.length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      !validateEmailReal(email) &&
      passwordStrength.isValid &&
      passwordMatch &&
      Object.keys(validationErrors).filter((key) => validationErrors[key])
        .length === 0
    );
  }, [
    mode,
    email,
    password,
    confirmPassword,
    passwordMatch,
    passwordStrength.isValid,
    validationErrors,
  ]);

  return {
    // State
    mode,
    showPassword,
    showConfirmPassword,
    error,
    validationErrors,
    isLoading,
    password,
    confirmPassword,
    email,
    passwordMatch,
    passwordStrength,
    isFormValid,

    // Actions
    setMode,
    setShowPassword,
    setShowConfirmPassword,
    setError,
    setValidationErrors,
    setIsLoading,
    setPassword,
    setConfirmPassword,
    setEmail,
    validateField,
    clearErrors,
    resetForm,
    switchMode,
    handleServerResponse,
  };
}
