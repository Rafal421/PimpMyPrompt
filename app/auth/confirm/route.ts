import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuditLogger } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error, data } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      if (data.user) {
        await AuditLogger.log("EMAIL_CONFIRMED", data.user.id, { type });
      }
      redirect(type === "recovery" ? "/auth/update-password" : next);
    }
  }

  if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (data.user) {
        await AuditLogger.log("SESSION_EXCHANGED", data.user.id);
      }
      const isPasswordReset = next.includes("update-password") || next === "/";
      redirect(isPasswordReset ? "/auth/update-password" : next);
    }
  }

  redirect("/error");
}
