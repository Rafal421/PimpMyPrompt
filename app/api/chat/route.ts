import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AuditLogger } from "@/lib/audit-logger";

// GET /api/chat?user_id={userId} - Fetch all chats for a user
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await AuditLogger.log("CHATS_FETCHED", user_id, {
      count: chats?.length || 0,
    });

    return NextResponse.json({ chats: chats || [] });
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat - Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { user_id, title } = await req.json();

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await AuditLogger.log("CHAT_CREATED", user_id, {
      chat_id: chat.id,
      title,
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error in POST /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/chat - Update chat title
export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { chat_id, user_id, title } = await req.json();

    if (!chat_id || !user_id) {
      return NextResponse.json(
        { error: "Missing chat_id or user_id" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const { data: chat, error } = await supabase
      .from("chats")
      .update({ title })
      .eq("id", chat_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      console.error("Error updating chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!chat) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    await AuditLogger.log("CHAT_UPDATED", user_id, {
      chat_id,
      new_title: title,
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error in PUT /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/chat - Delete a chat
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { chat_id, user_id } = await req.json();

    if (!chat_id || !user_id) {
      return NextResponse.json(
        { error: "Missing chat_id or user_id" },
        { status: 400 }
      );
    }

    // Delete the chat (messages will be deleted automatically due to cascade)
    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", chat_id)
      .eq("user_id", user_id);

    if (error) {
      console.error("Error deleting chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await AuditLogger.log("CHAT_DELETED", user_id, {
      chat_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
