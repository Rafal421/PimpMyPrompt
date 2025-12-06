"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { resetPassword } from "@/app/auth/reset-password/actions";
import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/AuthInput";
import { Background } from "@/components/ui/background";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Mail,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await resetPassword(email);

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message || "Password reset link has been sent.",
      });
      setEmail("");
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
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-white mb-2">
              Reset Password
            </CardTitle>
            <CardDescription className="text-gray-400 text-lg">
              Enter your email to receive a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
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
              onSubmit={handleResetPassword}
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <AuthInput
                id="email"
                name="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </motion.form>

            <motion.div
              className="text-center pt-4 border-t border-gray-800/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link
                href="/sign-in"
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white font-medium transition-colors duration-200 hover:underline mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
