// app/login/OptimizedLoginPage.tsx - Optimized login page
"use client";

import { useCallback, useState } from "react";
import { login, signup } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Bot, CheckCircle } from "lucide-react";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import { AuthInput } from "@/components/ui_auth/AuthInput";

export default function OptimizedAuthPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    mode,
    error,
    validationErrors,
    isLoading,
    password,
    confirmPassword,
    email,
    passwordMatch,
    passwordStrength,
    isFormValid,
    setPassword,
    setConfirmPassword,
    setEmail,
    validateField,
    switchMode,
    handleServerResponse,
    setIsLoading,
  } = useAuthForm();

  const handleLogin = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        const result = await login(formData);
        handleServerResponse(result);
      } catch (error) {
        console.error("Login error:", error);
        handleServerResponse({ error: "Wystąpił nieoczekiwany błąd" });
      }
    },
    [setIsLoading, handleServerResponse]
  );

  const handleSignup = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        const result = await signup(formData);

        // Jeśli rejestracja się powiodła
        if (result?.success) {
          // Resetuj formularz
          setPassword("");
          setConfirmPassword("");
          setEmail("");
          setSuccessMessage(result.message || "Konto zostało utworzone!");

          // Przełącz na login po 2 sekundach
          setTimeout(() => {
            switchMode("login");
            setSuccessMessage(null);
          }, 4000);

          setIsLoading(false);
        } else {
          // Obsłuż błędy
          handleServerResponse(result);
        }
      } catch (error) {
        console.error("Signup error:", error);
        handleServerResponse({ error: "Wystąpił nieoczekiwany błąd" });
      }
    },
    [
      setIsLoading,
      handleServerResponse,
      setPassword,
      setConfirmPassword,
      setEmail,
      setSuccessMessage,
      switchMode,
    ]
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.05),transparent_50%)]" />

        {/* Animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <Card className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Bot className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            {mode === "login" ? (
              <>
                Zaloguj się do{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </>
            ) : (
              <>
                Dołącz do{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            {mode === "login"
              ? "Zaloguj się do swojego konta"
              : "Utwórz konto i zacznij korzystać z AI"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {successMessage && (
            <Alert className="bg-green-900/20 backdrop-blur-sm border border-green-800/50 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-900/20 backdrop-blur-sm border border-red-800/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "login" ? (
            <form action={handleLogin} className="space-y-6">
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Adres email"
                placeholder="Wprowadź swój email"
                value={email}
                error={validationErrors.email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField("email", e.target.value);
                }}
              />

              <AuthInput
                id="password"
                name="password"
                type="password"
                label="Hasło"
                placeholder="Wprowadź swoje hasło"
                error={validationErrors.password}
                required
              />

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          ) : (
            <form action={handleSignup} className="space-y-6">
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Adres email"
                placeholder="Wprowadź swój email"
                value={email}
                error={validationErrors.email}
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateField("email", e.target.value);
                }}
              />

              <div className="space-y-2">
                <AuthInput
                  id="password"
                  name="password"
                  label="Hasło"
                  placeholder="Utwórz hasło"
                  value={password}
                  error={validationErrors.password}
                  required
                  showPasswordToggle
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                    // Sprawdź ponownie zgodność haseł gdy zmienia się główne hasło
                    if (confirmPassword) {
                      validateField("confirmPassword", confirmPassword);
                    }
                  }}
                />

                {/* Zawsze pokazuj wymagania dla signup */}
                {mode === "signup" && (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                )}
              </div>

              <div className="space-y-2">
                <AuthInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Potwierdź hasło"
                  placeholder="Potwierdź swoje hasło"
                  value={confirmPassword}
                  error={validationErrors.confirmPassword}
                  required
                  showPasswordToggle
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validateField("confirmPassword", e.target.value);
                  }}
                />

                {confirmPassword.length > 0 &&
                  !validationErrors.confirmPassword && (
                    <PasswordMatchIndicator isMatch={passwordMatch} />
                  )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
              </Button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-gray-800/50">
            <p className="text-gray-400 text-sm">
              {mode === "login" ? (
                <>
                  Nie masz konta?{" "}
                  <button
                    type="button"
                    className="text-white hover:text-blue-400 font-medium transition-colors duration-200 hover:underline"
                    onClick={() => switchMode("signup")}
                  >
                    Utwórz konto
                  </button>
                </>
              ) : (
                <>
                  Masz już konto?{" "}
                  <button
                    type="button"
                    className="text-white hover:text-blue-400 font-medium transition-colors duration-200 hover:underline"
                    onClick={() => switchMode("login")}
                  >
                    Zaloguj się tutaj
                  </button>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Komponenty pomocnicze
function PasswordStrengthIndicator({ strength }: { strength: any }) {
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <div className="flex gap-1">
          {[1, 2, 3].map((level) => (
            <div
              key={level}
              className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                strength.strength >= level
                  ? strength.strength === 1
                    ? "bg-red-400"
                    : strength.strength === 2
                    ? "bg-yellow-400"
                    : "bg-green-400"
                  : "bg-gray-600"
              }`}
            />
          ))}
        </div>
        <span className="text-gray-400">
          {strength.strength === 0 && "Wprowadź hasło"}
          {strength.strength === 1 && "Słabe"}
          {strength.strength === 2 && "Średnie"}
          {strength.strength === 3 && "Silne"}
        </span>
      </div>

      {/* Zawsze pokazuj wymagania w trybie signup */}
      <div className="space-y-1">
        {Object.entries(strength.checks).map(([key, passed]) => (
          <PasswordRequirement
            key={key}
            passed={passed as boolean}
            text={getRequirementText(key)}
          />
        ))}
      </div>
    </div>
  );
}

function PasswordRequirement({
  passed,
  text,
}: {
  passed: boolean;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {passed ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <AlertCircle className="h-3 w-3 text-gray-500" />
      )}
      <span className={passed ? "text-green-400" : "text-gray-500"}>
        {text}
      </span>
    </div>
  );
}

function PasswordMatchIndicator({ isMatch }: { isMatch: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs mt-2">
      {isMatch ? (
        <>
          <Check className="h-3 w-3 text-green-400" />
          <span className="text-green-400">Hasła są zgodne</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span className="text-red-400">Hasła nie są zgodne</span>
        </>
      )}
    </div>
  );
}

function getRequirementText(key: string): string {
  switch (key) {
    case "length":
      return "Co najmniej 6 znaków";
    case "uppercase":
      return "Co najmniej 1 wielka litera";
    case "special":
      return "Co najmniej 1 znak specjalny";
    default:
      return "";
  }
}
