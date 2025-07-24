"use client";
import { useState } from "react";
import { redirect } from "next/navigation";
import { login, signup } from "./actions";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, AlertCircle, Check, Bot } from "lucide-react";

// Zod schemas for client-side validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password cannot be more than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  // signup state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordMatch = password === confirmPassword && password.length > 0;

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;
    return { checks, strength: passedChecks };
  };

  const passwordStrength = getPasswordStrength(password);

  async function handleLogin(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    // Client-side validation
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    const validation = loginSchema.safeParse(rawData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const result = (await login(formData)) as { error?: string } | undefined;
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
      // If no error, redirect happens in the action
    } catch (error) {
      // To catch unexpected errors and network issues
      console.error("Login error:", error);
      redirect(`/error?message=Unexpected login error occurred`);
    }
  }

  async function handleSignup(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setValidationErrors({});

    // Client-side validation
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const validation = signupSchema.safeParse(rawData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    const result = (await signup(formData)) as { error?: string } | undefined;
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

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
          {error && (
            <Alert className="bg-red-900/20 backdrop-blur-sm border border-red-800/50 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "login" ? (
            <form action={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-white text-sm font-medium"
                >
                  Adres email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Wprowadź swój email"
                  required
                  className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 ${
                    validationErrors.email
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-gray-800/50"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-white text-sm font-medium"
                >
                  Hasło
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Wprowadź swoje hasło"
                  required
                  className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 ${
                    validationErrors.password
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-gray-800/50"
                  }`}
                />
                {validationErrors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logowanie..." : "Zaloguj się"}
              </Button>
            </form>
          ) : (
            <form action={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-white text-sm font-medium"
                >
                  Adres email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Wprowadź swój email"
                  required
                  className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 ${
                    validationErrors.email
                      ? "border-red-500/50 focus:border-red-500"
                      : "border-gray-800/50"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-white text-sm font-medium"
                >
                  Hasło
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Utwórz hasło"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 pr-12 ${
                      validationErrors.password
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-gray-800/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.password}
                  </p>
                )}
                {!validationErrors.password && password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-2 w-8 rounded-full transition-colors duration-200 ${
                              passwordStrength.strength >= level
                                ? passwordStrength.strength === 1
                                  ? "bg-red-400"
                                  : passwordStrength.strength === 2
                                  ? "bg-yellow-400"
                                  : "bg-green-400"
                                : "bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-400">
                        {passwordStrength.strength === 1 && "Słabe"}
                        {passwordStrength.strength === 2 && "Średnie"}
                        {passwordStrength.strength === 3 && "Silne"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.length ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-500" />
                        )}
                        <span
                          className={
                            passwordStrength.checks.length
                              ? "text-green-400"
                              : "text-gray-500"
                          }
                        >
                          Co najmniej 6 znaków
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.uppercase ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-500" />
                        )}
                        <span
                          className={
                            passwordStrength.checks.uppercase
                              ? "text-green-400"
                              : "text-gray-500"
                          }
                        >
                          Co najmniej 1 wielka litera
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {passwordStrength.checks.special ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <AlertCircle className="h-3 w-3 text-gray-500" />
                        )}
                        <span
                          className={
                            passwordStrength.checks.special
                              ? "text-green-400"
                              : "text-gray-500"
                          }
                        >
                          Co najmniej 1 znak specjalny
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {!validationErrors.password && password.length === 0 && (
                  <p className="text-xs text-gray-500">
                    Hasło musi mieć: <br /> 6 znaków, <br /> 1 wielką literę,{" "}
                    <br /> 1 znak specjalny
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-white text-sm font-medium"
                >
                  Potwierdź hasło
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Potwierdź swoje hasło"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-gray-900/50 backdrop-blur-sm border text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 h-12 rounded-xl hover:border-gray-700/50 transition-all duration-200 pr-12 ${
                      validationErrors.confirmPassword
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-gray-800/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
                {confirmPassword.length > 0 &&
                  !validationErrors.confirmPassword && (
                    <div className="flex items-center gap-2 text-xs mt-2">
                      {passwordMatch ? (
                        <>
                          <Check className="h-3 w-3 text-green-400" />
                          <span className="text-green-400">
                            Hasła są zgodne
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 text-red-400" />
                          <span className="text-red-400">
                            Hasła nie są zgodne
                          </span>
                        </>
                      )}
                    </div>
                  )}
              </div>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !passwordMatch ||
                  Object.keys(validationErrors).length > 0
                }
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
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                      setValidationErrors({});
                    }}
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
                    onClick={() => {
                      setMode("login");
                      setError(null);
                      setValidationErrors({});
                    }}
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
