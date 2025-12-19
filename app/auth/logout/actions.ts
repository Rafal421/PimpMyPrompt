"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { AuditLogger } from "@/lib/logging/audit-logger";

export async function logoutUser(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await AuditLogger.log("LOGOUT", user.id);
  }

  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function logout() {
  return logoutUser();
}
