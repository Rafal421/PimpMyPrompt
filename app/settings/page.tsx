"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User, ArrowLeft } from "lucide-react";
import type { User as UserType } from "@/lib/types";
import { ProfileSection } from "@/components/settings/ProfileSection";
import { SecuritySection } from "@/components/settings/SecuritySection";
import { useProfile } from "@/hooks/private/settings/useProfile";
import { usePasswordChange } from "@/hooks/private/settings/usePasswordChange";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const profileHook = useProfile(user);
  const passwordHook = usePasswordChange();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser({ id: user.id, email: user.email });

      setTimeout(() => profileHook.loadProfile(), 0);
    } catch (error) {
      console.error("Error checking user:", error);
      profileHook.setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const error = profileHook.error || passwordHook.error;
  const success = !error ? (profileHook.success || passwordHook.success) : "";

  const clearAllMessages = () => {
    profileHook.setError("");
    profileHook.setSuccess("");
    passwordHook.setError("");
    passwordHook.setSuccess("");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-400 text-sm">
                Manage your account preferences
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="mb-6 min-h-[60px]">
          {error ? (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          ) : success ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
              {success}
            </div>
          ) : (
            <div className="invisible p-4 bg-transparent border border-transparent rounded-xl text-transparent text-sm">
              Placeholder message for height
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          <ProfileSection
            user={user}
            firstName={profileHook.firstName}
            setFirstName={profileHook.setFirstName}
            lastName={profileHook.lastName}
            setLastName={profileHook.setLastName}
            dateOfBirth={profileHook.dateOfBirth}
            setDateOfBirth={profileHook.setDateOfBirth}
            onSave={profileHook.saveProfile}
            isSaving={profileHook.isSaving}
          />

          <SecuritySection
            currentPassword={passwordHook.currentPassword}
            setCurrentPassword={passwordHook.setCurrentPassword}
            newPassword={passwordHook.newPassword}
            setNewPassword={passwordHook.setNewPassword}
            confirmPassword={passwordHook.confirmPassword}
            setConfirmPassword={passwordHook.setConfirmPassword}
            onChangePassword={passwordHook.changePassword}
            onClearFields={() => {
              passwordHook.clearFields();
              clearAllMessages();
            }}
            isSaving={passwordHook.isSaving}
          />
        </div>
      </div>
    </div>
  );
}
