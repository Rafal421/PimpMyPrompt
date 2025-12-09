"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const SESSION_TIMEOUT = 30 * 60 * 1000;
const WARNING_TIME = 5 * 60 * 1000;

export function useSessionTimeout() {
  const router = useRouter();
  const supabase = createClient();
  const warningShownRef = useRef(false);

  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;
    let warningTimer: NodeJS.Timeout;

    warningTimer = setTimeout(() => {
      if (!warningShownRef.current) {
        warningShownRef.current = true;
        console.warn(
          "⚠️ Session will expire in 5 minutes. You will be logged out."
        );
      }
    }, SESSION_TIMEOUT - WARNING_TIME);

    logoutTimer = setTimeout(async () => {
      console.log("🔓 Session expired. Logging out...");
      await supabase.auth.signOut();
      router.push("/sign-in?reason=session-expired");
    }, SESSION_TIMEOUT);

    return () => {
      clearTimeout(logoutTimer);
      clearTimeout(warningTimer);
    };
  }, [router, supabase]);
}
