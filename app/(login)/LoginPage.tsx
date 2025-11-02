"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { AlertCircle, CheckCircle, Loader2, Bot } from "lucide-react";
import { useAuthForm } from "@/hooks/auth/useAuthForm";
import { Background } from "@/components/ui/background";
import { AuthInput } from "@/components/auth/AuthInput";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import { createClient } from "@/utils/supabase/client";

interface OptimizedAuthPageProps {
  initialMode?: "login" | "signup";
}

export default function OptimizedAuthPage({ initialMode = "login" }: OptimizedAuthPageProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/private");
      }
    };
    checkUser();
  }, [router, supabase.auth]);

  const {
    mode,
    error,
    validationErrors,
    isLoading,
    password,
    confirmPassword,
    email,
    isFormValid,
    setPassword,
    setConfirmPassword,
    setEmail,
    validateField,
    switchMode: originalSwitchMode,
    handleServerResponse,
    setIsLoading,
    setMode,
  } = useAuthForm();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode, setMode]);

  const switchMode = useCallback(
    (newMode: "login" | "signup") => {
      originalSwitchMode(newMode);
      const newPath = newMode === "login" ? "/sign-in" : "/sign-up";
      router.push(newPath);
    },
    [originalSwitchMode, router]
  );

  const handleLogin = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const result = await login(formData);
        handleServerResponse(result);
      } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return;
        }
        handleServerResponse({ error: "An unexpected error occurred" });
      }
    },
    [setIsLoading, handleServerResponse]
  );

  const handleSignup = useCallback(
    async (formData: FormData) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const result = await signup(formData);
        if (result?.success) {
          setPassword("");
          setConfirmPassword("");
          setEmail("");
          setSuccessMessage(result.message || "Account created successfully!");
          setTimeout(() => {
            switchMode("login");
            setSuccessMessage(null);
          }, 4000);
          setIsLoading(false);
        } else {
          handleServerResponse(result);
        }
      } catch (error) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
          return;
        }
        handleServerResponse({ error: "An unexpected error occurred" });
      }
    },
    [setIsLoading, handleServerResponse, setPassword, setConfirmPassword, setEmail, setSuccessMessage, switchMode]
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      <Background />
      <motion.div
        initial={{ y: 40, scale: 0.95, opacity: 0 }}
        animate={{
          y: 0,
          scale: 1,
          opacity: 1,
          transition: {
            duration: 1.8,
            ease: [0.23, 1, 0.32, 1],
          },
        }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="bg-black/40 backdrop-blur-md border border-gray-800/50 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
            </div>
            <motion.div
              initial={{ y: 15 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
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
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Success message display */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-green-900/20 backdrop-blur-sm border border-green-800/50 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{successMessage}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
              {/* Error message display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert className="bg-red-900/20 backdrop-blur-sm border border-red-800/50 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {mode === "login" ? (
                <motion.form
                  key="login"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    await handleLogin(formData);
                  }}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 1.8,
                      ease: [0.23, 1, 0.32, 1],
                      staggerChildren: 0.15,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -40,
                    scale: 0.95,
                    transition: {
                      duration: 1.2,
                      ease: [0.23, 1, 0.32, 1],
                    },
                  }}
                >
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
                    showPasswordToggle
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validateField("password", e.target.value);
                    }}
                  />

                  <div className="text-right">
                    <a
                      href="/auth/reset-password"
                      className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing in...
                        </div>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    await handleSignup(formData);
                  }}
                  className="space-y-6"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 1.8,
                      ease: [0.23, 1, 0.32, 1],
                      staggerChildren: 0.15,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    y: -40,
                    scale: 0.95,
                    transition: {
                      duration: 1.2,
                      ease: [0.23, 1, 0.32, 1],
                    },
                  }}
                >
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

                  <PasswordValidation
                    password={password}
                    confirmPassword={confirmPassword}
                    onPasswordChange={(newPassword) => {
                      setPassword(newPassword);
                      validateField("password", newPassword);
                      if (confirmPassword) {
                        validateField("confirmPassword", confirmPassword);
                      }
                    }}
                    onConfirmPasswordChange={(newConfirmPassword) => {
                      setConfirmPassword(newConfirmPassword);
                      validateField("confirmPassword", newConfirmPassword);
                    }}
                    showValidation={true}
                    showConfirmPassword={true}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !isFormValid}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>
            {!isLoading && (
              <motion.div
                className="text-center pt-4 border-t border-gray-800/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
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
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
