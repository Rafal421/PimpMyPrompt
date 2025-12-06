"use server";

import { createClient } from "@/utils/supabase/server";
import { type ActionResult } from "@/lib/validation";
import { AuditLogger } from "@/lib/audit-logger";
import { ERROR_MESSAGES, mapSupabaseError } from "@/app/auth/actions";

export async function resetPassword(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(
        "/auth/update-password"
      )}`,
    });

    if (error) {
      await AuditLogger.log("PASSWORD_RESET_FAILED", email, {
        error_type: error.message,
      });
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }

    await AuditLogger.log("PASSWORD_RESET_REQUESTED", email);
    return {
      success: true,
      message: "Password reset link has been sent.",
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}
