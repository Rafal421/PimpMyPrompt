"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { AuthInput } from "./AuthInput";
import { validatePassword } from "@/lib/validation";

interface PasswordValidationProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  showValidation?: boolean;
  showConfirmPassword?: boolean;
}

export function PasswordValidation({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  showValidation = true,
  showConfirmPassword = true,
}: PasswordValidationProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [hasStartedTypingConfirm, setHasStartedTypingConfirm] = useState(false);

  const passwordMatch = useMemo(
    () => password === confirmPassword && password.length > 0 && confirmPassword.length > 0,
    [password, confirmPassword]
  );

  const passwordStrength = useMemo(() => validatePassword(password), [password]);

  const isValid = useMemo(() => {
    if (!showConfirmPassword) return passwordStrength.isValid;
    return passwordStrength.isValid && passwordMatch;
  }, [passwordStrength.isValid, passwordMatch, showConfirmPassword]);

  const handlePasswordChange = (newPassword: string) => {
    if (newPassword.length > 0 && !hasStartedTyping) setHasStartedTyping(true);
    onPasswordChange(newPassword);
  };

  const handleConfirmPasswordChange = (newConfirmPassword: string) => {
    if (newConfirmPassword.length > 0 && !hasStartedTypingConfirm) setHasStartedTypingConfirm(true);
    onConfirmPasswordChange(newConfirmPassword);
  };

  return (
    <div className="space-y-4">
      <AuthInput
          id="password"
          name="password"
          type="password"
          label="New Password"
          placeholder="Enter new password"
          value={password}
          required
          showPasswordToggle={true}
          onChange={(e) => handlePasswordChange(e.target.value)}
        />

      {showValidation && (password.length > 0 || hasStartedTyping) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PasswordStrengthIndicator strength={passwordStrength} />
        </motion.div>
      )}

      {showConfirmPassword && (
        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirm New Password"
          placeholder="Confirm new password"
          value={confirmPassword}
          required
          showPasswordToggle={true}
          onChange={(e) => handleConfirmPasswordChange(e.target.value)}
        />
      )}

      {showConfirmPassword && (confirmPassword.length > 0 || hasStartedTypingConfirm) && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <PasswordMatchIndicator isMatch={passwordMatch} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function PasswordStrengthIndicator({ strength }: { strength: { strength: number; checks: Record<string, boolean> } }) {
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
          {strength.strength === 0 && "Password required"}
          {strength.strength === 1 && "Weak"}
          {strength.strength === 2 && "Medium"}
          {strength.strength === 3 && "Strong"}
        </span>
      </div>
      <div className="space-y-1">
        {Object.entries(strength.checks).map(([key, passed]) => (
          <PasswordRequirement key={key} passed={passed as boolean} text={getRequirementText(key)} />
        ))}
      </div>
    </div>
  );
}

function PasswordRequirement({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {passed ? (
        <Check className="h-3 w-3 text-green-400" />
      ) : (
        <AlertCircle className="h-3 w-3 text-gray-500" />
      )}
      <span className={passed ? "text-green-400" : "text-gray-500"}>{text}</span>
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
          <span className="text-red-400">Passwords must match</span>
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
