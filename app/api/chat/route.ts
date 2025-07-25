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

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { chat_id, user_id } = await req.json();

  if (!chat_id || !user_id) {
    return NextResponse.json(
      { error: "Missing chat_id or user_id" },
      { status: 400 }
    );
  }

  // First delete all messages for this chat
  const { error: messagesError } = await supabase
    .from("messages")
    .delete()
    .eq("chat_id", chat_id);

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 });
  }

  // Then delete the chat itself
  const { error: chatError } = await supabase
    .from("chats")
    .delete()
    .eq("id", chat_id)
    .eq("user_id", user_id); // Ensure user can only delete their own chats

  if (chatError) {
    return NextResponse.json({ error: chatError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
