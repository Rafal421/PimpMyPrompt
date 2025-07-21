import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { user_id, title } = await req.json();

  const { data, error } = await supabase
    .from("chats")
    .insert({ user_id, title })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ chat: data });
}

export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
  
    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }
  
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ chats: data });
  }