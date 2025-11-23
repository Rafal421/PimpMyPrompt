"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { validateProfile } from "@/lib/validation";
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

      if (profileError) {
        if (profileError.code === "PGRST116") {
          console.log("Profile not found, will be created when user saves data");
          setFirstName("");
          setLastName("");
          setDateOfBirth("");
        } else {
          console.error("Error fetching profile:", profileError);
          setError("Failed to load profile data. This might be normal for new accounts.");
        }
      } else if (profileData) {
        setProfile(profileData);
        setFirstName(profileData.first_name || "");
        setLastName(profileData.last_name || "");
        setDateOfBirth(profileData.date_of_birth || "");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setError("Failed to load user data");
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
        console.error("Profile upsert error:", upsertError);
        throw upsertError;
      }

      if (data) {
        setProfile(data);
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: any) {
      console.error("Error saving profile:", error);

      if (error.code === "42P01") {
        setError("Database table not found. Please contact support.");
      } else if (error.code === "23505") {
        setError("Profile already exists. Please refresh the page and try again.");
      } else {
        setError(error.message || "Failed to save profile. Please try again.");
      }
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
