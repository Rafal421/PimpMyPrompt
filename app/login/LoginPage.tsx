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
import { Background } from "@/components/ui/background";
import { AuthInput } from "@/components/auth/AuthInput";

// Main authentication component with login/signup forms
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

  // Handle login form submission
  const handleLogin = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        const result = await login(formData);
        handleServerResponse(result);
      } catch (error) {
        // Check if error is a Next.js redirect (successful login)
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          // Don't handle redirect as error - it means successful login
          return;
        }
        console.error("Login error:", error);
        handleServerResponse({ error: "An unexpected error occurred" });
      }
    },
    [setIsLoading, handleServerResponse]
  );

  // Handle signup form submission with success flow
  const handleSignup = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        const result = await signup(formData);

        // If registration is successful
        if (result?.success) {
          // Reset form
          setPassword("");
          setConfirmPassword("");
          setEmail("");
          setSuccessMessage(result.message || "Account created successfully!");

          // Switch to login after 2 seconds
          setTimeout(() => {
            switchMode("login");
            setSuccessMessage(null);
          }, 4000);

          setIsLoading(false);
        } else {
          // Handle errors
          handleServerResponse(result);
        }
      } catch (error) {
        // Check if error is a Next.js redirect
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          // Don't handle redirect as error
          return;
        }
        console.error("Signup error:", error);
        handleServerResponse({ error: "An unexpected error occurred" });
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
      {/* Animated gradient background with floating blobs */}
      <Background />

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
                Sign in to{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </>
            ) : (
              <>
                Join{" "}
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  AI Assistant
                </span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400 text-lg">
            {mode === "login"
              ? "Sign in to your account"
              : "Create an account and start using AI"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success message display */}
          {successMessage && (
            <Alert className="bg-green-900/20 backdrop-blur-sm border border-green-800/50 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Error message display */}
          {error && (
            <Alert className="bg-red-900/20 backdrop-blur-sm border border-red-800/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login form */}
          {mode === "login" ? (
            <form action={handleLogin} className="space-y-6">
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
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
                label="Password"
                placeholder="Enter your password"
                value={password}
                error={validationErrors.password}
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateField("password", e.target.value);
                }}
              />

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          ) : (
            // Signup form with password validation
            <form action={handleSignup} className="space-y-6">
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
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
                  label="Password"
                  placeholder="Create password"
                  value={password}
                  error={validationErrors.password}
                  required
                  showPasswordToggle
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validateField("password", e.target.value);
                    // Check password match again when main password changes
                    if (confirmPassword) {
                      validateField("confirmPassword", confirmPassword);
                    }
                  }}
                />

                {/* Always show requirements for signup */}
                {mode === "signup" && (
                  <PasswordStrengthIndicator strength={passwordStrength} />
                )}
              </div>

              <div className="space-y-2">
                <AuthInput
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Confirm your password"
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
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-gray-800/50">
            {/* Mode switching buttons */}
            <p className="text-gray-400 text-sm">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    className="text-white hover:text-blue-400 font-medium transition-colors duration-200 hover:underline"
                    onClick={() => switchMode("signup")}
                  >
                    Create Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-white hover:text-blue-400 font-medium transition-colors duration-200 hover:underline"
                    onClick={() => switchMode("login")}
                  >
                    Sign in here
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

// Password strength indicator component
function PasswordStrengthIndicator({
  strength,
}: {
  strength: { strength: number; checks: Record<string, boolean> };
}) {
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
          {strength.strength === 0 && "Enter password"}
          {strength.strength === 1 && "Weak"}
          {strength.strength === 2 && "Medium"}
          {strength.strength === 3 && "Strong"}
        </span>
      </div>

      {/* Always show requirements in signup mode */}
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
          <span className="text-green-400">Passwords match</span>
        </>
      ) : (
        <>
          <AlertCircle className="h-3 w-3 text-red-400" />
          <span className="text-red-400">Passwords don&apos;t match</span>
        </>
      )}
    </div>
  );
}

function getRequirementText(key: string): string {
  switch (key) {
    case "length":
      return "At least 6 characters";
    case "uppercase":
      return "At least 1 uppercase letter";
    case "special":
      return "At least 1 special character";
    default:
      return "";
  }
}
