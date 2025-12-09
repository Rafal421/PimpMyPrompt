"use server";

import { createClient } from "@/utils/supabase/server";
import { type ActionResult } from "@/lib/validation";
import { AuditLogger } from "@/lib/audit-logger";
import { ERROR_MESSAGES } from "@/lib/auth-errors";

export async function updatePassword(password: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (user) {
        await AuditLogger.log("PASSWORD_UPDATE_FAILED", user.id, {
          error_type: error.message,
        });
      }
      return {
        success: false,
        error: error.message,
      };
    }

    if (user) {
      await AuditLogger.log("PASSWORD_UPDATED", user.id);
    }
    await supabase.auth.signOut();

    return {
      success: true,
      message:
        "Password updated successfully! Please sign in with your new password.",
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}
