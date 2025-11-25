"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AuditLogger } from "@/lib/audit-logger";

export function usePasswordChange() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const changePassword = async () => {
    if (!newPassword || !confirmPassword || !currentPassword) {
      setError("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error("User not authenticated");
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword,
      });

      if (signInError) {
        await AuditLogger.log("PASSWORD_CHANGE_FAILED", user.user.id, { reason: "Invalid current password" });
        throw new Error("Current password is incorrect");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        await AuditLogger.log("PASSWORD_CHANGE_FAILED", user.user.id, { reason: error.message });
        throw error;
      }

      await AuditLogger.log("PASSWORD_CHANGED", user.user.id);
      setSuccess("Password updated successfully!");
      clearFields();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      const sanitizedError = error.message?.includes("email") ? "Authentication failed" : error.message;
      setError(sanitizedError || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const clearFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  return {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isSaving,
    error,
    success,
    setError,
    setSuccess,
    changePassword,
    clearFields,
  };
}
