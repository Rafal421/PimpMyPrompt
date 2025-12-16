import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AuditLogger } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chat_id, from, content } = await req.json();

  // Validate required fields
  if (!chat_id || typeof chat_id !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid chat_id" },
      { status: 400 }
    );
  }

  if (!from || typeof from !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid from field" },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Missing or invalid content" },
      { status: 400 }
    );
  }

  // Validate from field against allowlist
  const validFromValues = ["user", "assistant", "bot"] as const;
  if (!validFromValues.includes(from as any)) {
    return NextResponse.json(
      { error: "Invalid 'from' field value" },
      { status: 400 }
    );
  }

  // Validate content length
  if (content.length > 5000) {
    return NextResponse.json(
      { error: "Content too long (max 5000 characters)" },
      { status: 400 }
    );
  }

  // Verify that the chat belongs to the authenticated user
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chat_id)
    .eq("user_id", user.id)
    .single();

  if (chatError || !chat) {
    return NextResponse.json(
      { error: "Chat not found or access denied" },
      { status: 403 }
    );
  }

  const { error } = await supabase.from("messages").insert({
    chat_id,
    user_id: user.id,
    from,
    content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await AuditLogger.log("MESSAGE_STORED", user.id, {
    chat_id,
    from,
    content_length: content?.length || 0,
  });
  return NextResponse.json({
    success: true,
    message: { chat_id, user_id: user.id, from, content },
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chat_id = searchParams.get("chat_id");

  if (!chat_id) {
    return NextResponse.json({ error: "Missing chat_id" }, { status: 400 });
  }

  // Verify that the chat belongs to the authenticated user
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("id")
    .eq("id", chat_id)
    .eq("user_id", user.id)
    .single();

  if (chatError || !chat) {
    return NextResponse.json(
      { error: "Chat not found or access denied" },
      { status: 403 }
    );
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
