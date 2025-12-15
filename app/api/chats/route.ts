import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AuditLogger } from "@/lib/audit-logger";

// GET /api/chats - Fetch all chats for authenticated user
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data: chats, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching chats:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await AuditLogger.log("CHATS_FETCHED", user.id, {
      count: chats?.length || 0,
    });

    return NextResponse.json({ chats: chats || [] });
  } catch (error) {
    console.error("Error in GET /api/chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create a new chat
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, mode } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    const { data: chat, error } = await supabase
      .from("chats")
      .insert({
        user_id: user.id,
        title,
        mode: mode || "PMP",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await AuditLogger.log("CHAT_CREATED", user.id, {
      chat_id: chat.id,
      title,
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error in POST /api/chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/chats - Update chat title
export async function PUT(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { chat_id, title } = await req.json();

    if (!chat_id) {
      return NextResponse.json(
        { error: "Missing chat_id" },
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
      .eq("user_id", user.id)
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

    await AuditLogger.log("CHAT_UPDATED", user.id, {
      chat_id,
      new_title: title,
    });

    return NextResponse.json({ chat });
  } catch (error) {
    console.error("Error in PUT /api/chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/chats - Delete a chat
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { chat_id } = await req.json();

    if (!chat_id) {
      return NextResponse.json(
        { error: "Missing chat_id" },
        { status: 400 }
      );
    }

    // Delete the chat (messages will be deleted automatically due to cascade)
    const { error, count } = await supabase
      .from("chats")
      .delete()
      .eq("id", chat_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json(
        { error: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    await AuditLogger.log("CHAT_DELETED", user.id, {
      chat_id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/chats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
