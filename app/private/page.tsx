import { createClient } from "@/utils/supabase/server";
import ChatClient from "../../components/private/ChatClient";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }
  return <ChatClient user={data.user} />;
}
