"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { PasswordValidation } from "@/components/auth/PasswordValidation";
import { Background } from "@/components/ui/background";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { validatePassword } from "@/lib/validation";
import { updatePassword } from "@/app/auth/update-password/actions";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isPasswordUpdated = useRef(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const signOutAndRedirect = async () => {
      if (!isPasswordUpdated.current) {
        await supabase.auth.signOut();
        router.replace("/sign-in");
      }
    };

    const handleBeforeUnload = () => {
      if (!isPasswordUpdated.current) {
        supabase.auth.signOut();
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && !isPasswordUpdated.current) {
        await signOutAndRedirect();
      }
    };

    const handlePopState = async () => {
      await signOutAndRedirect();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [supabase.auth, router]);

  // Password validation using the shared validation logic
  const passwordStrength = validatePassword(password);
  const passwordMatch =
    password === confirmPassword &&
    password.length > 0 &&
    confirmPassword.length > 0;

  const isFormValid = passwordStrength.isValid && passwordMatch;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (!passwordMatch) {
      setMessage({ type: "error", text: "Passwords do not match." });
      setIsLoading(false);
      return;
    }

    if (!passwordStrength.isValid) {
      setMessage({
        type: "error",
        text: "Password must meet all requirements.",
      });
      setIsLoading(false);
      return;
    }

    const result = await updatePassword(password);

    if (result.success) {
      isPasswordUpdated.current = true;
      setMessage({
        type: "success",
        text: result.message || "Password updated successfully!",
      });
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 2000);
    } else {
      setMessage({ type: "error", text: result.error || "An error occurred." });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      <Background />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
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
                <Lock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Update Password
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Enter your new password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-yellow-900/20 border-yellow-800/50 text-yellow-400">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                If you leave this page, your reset link will expire and
                you&apos;ll need to request a new one.
              </AlertDescription>
            </Alert>

            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    className={
                      message.type === "success"
                        ? "bg-green-900/20 backdrop-blur-sm border border-green-800/50 text-green-400"
                        : "bg-red-900/20 backdrop-blur-sm border border-red-800/50 text-red-400"
                    }
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleUpdatePassword}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <PasswordValidation
                password={password}
                confirmPassword={confirmPassword}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                showValidation={true}
                showConfirmPassword={true}
              />

              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </div>
                ) : (
                  "Update Password"
                )}
              </Button>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
