"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateProfile } from "@/lib/validation";
import { AuditLogger } from "@/lib/audit-logger";
import type { User as UserType } from "@/lib/types";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  created_at?: string;
  updated_at?: string;
}

export function useProfile(user: UserType | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = createClient();

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        setError("Failed to load profile data.");
        return;
      }

      if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setDateOfBirth(profileData.date_of_birth || "");
      } else {
        setFirstName("");
        setLastName("");
        setDateOfBirth("");
        setProfile(null);
      }
    } catch (error: any) {
      setError("An unexpected error occurred. Please refresh and try again.");
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    const validationError = validateProfile(firstName, lastName, dateOfBirth);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const profileData = {
        id: user.id,
        email: user.email,
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        date_of_birth: dateOfBirth || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error: upsertError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (upsertError) {
        throw upsertError;
      }

      if (data) {
        setProfile(data);
      }

      await AuditLogger.log("PROFILE_UPDATED", user.id);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      let errorMessage = "Failed to save profile. Please try again.";

      if (error.code === "42P01") {
        errorMessage =
          "Service temporarily unavailable. Please contact support.";
      } else if (error.code === "23505") {
        errorMessage =
          "Profile conflict detected. Please refresh and try again.";
      } else if (error.code === "PGRST301") {
        errorMessage = "Permission denied. Please re-authenticate.";
      }

      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    dateOfBirth,
    setDateOfBirth,
    isSaving,
    error,
    success,
    setError,
    setSuccess,
    loadProfile,
    saveProfile,
  };
}
