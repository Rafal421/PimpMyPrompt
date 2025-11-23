"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

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
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setSuccess("Password updated successfully!");
      clearFields();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error changing password:", error);
      setError(error.message || "Failed to change password");
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
