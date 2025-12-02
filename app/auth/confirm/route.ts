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
      redirect(
        type === "recovery"
          ? "/auth/update-password"
          : "/sign-in?confirmed=true"
      );
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Nie logujemy użytkownika automatycznie - tylko potwierdzamy email
      // i przekierowujemy na stronę logowania
      const isPasswordReset = next.includes("update-password");

      if (isPasswordReset) {
        redirect("/auth/update-password");
      } else {
        redirect("/sign-in?confirmed=true");
      }
    }
  }

  redirect("/error");
}
