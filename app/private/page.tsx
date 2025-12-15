import { createClient } from "@/utils/supabase/server";
import ChatClient from "../../components/private/chat/ChatClient";
import { redirect } from "next/navigation";
import type { ChatMode } from "@/hooks/private/useChatAdapter";

interface PageProps {
  searchParams: Promise<{ mode?: string }>;
}

/**
 * DashboardPage - Main private dashboard page
 * Validates authentication and renders ChatClient with selected mode
 */
export default async function DashboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const mode = (params.mode as ChatMode) || "pmp";

  const validModes: ChatMode[] = ["pmp", "simple", "compare"];
  const finalMode = validModes.includes(mode) ? mode : "pmp";

  return <ChatClient user={data.user} mode={finalMode} />;
}
