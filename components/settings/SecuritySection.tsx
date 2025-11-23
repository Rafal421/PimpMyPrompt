"use client";

import { Save } from "lucide-react";
import { PasswordValidation } from "@/components/auth/PasswordValidation";

interface SecuritySectionProps {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  onChangePassword: () => void;
  onClearFields: () => void;
  isSaving: boolean;
}

export function SecuritySection({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  onChangePassword,
  onClearFields,
  isSaving,
}: SecuritySectionProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md border border-gray-800/50 rounded-xl p-6 shadow-2xl">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        Security
      </h2>

      <div className="space-y-4">
        <p className="text-gray-400 text-sm mb-4">
          Change your account password to keep your account secure.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-800/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-gray-700/50 transition-all duration-200"
            />
          </div>
        </div>

        <div className="space-y-4">
          <PasswordValidation
            password={newPassword}
            confirmPassword={confirmPassword}
            onPasswordChange={setNewPassword}
            onConfirmPasswordChange={setConfirmPassword}
            showValidation={true}
            showConfirmPassword={true}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={onChangePassword}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Updating..." : "Update Password"}
          </button>
          <button
            onClick={onClearFields}
            className="w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 text-gray-300 rounded-xl font-medium transition-all duration-200"
          >
            Clear Fields
          </button>
        </div>
      </div>
    </div>
  );
}
