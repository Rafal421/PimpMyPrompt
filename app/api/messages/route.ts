import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { chat_id, user_id, from, content } = await req.json();

  const { error } = await supabase.from("messages").insert({
    chat_id,
    user_id,
    from,
    content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}


export async function GET(req: NextRequest) {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const chat_id = searchParams.get("chat_id");
  
    if (!chat_id) {
      return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
    }
  
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: true });
  
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  
    return NextResponse.json({ messages: data });
  }