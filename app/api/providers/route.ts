import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AuditLogger } from "@/lib/logging/audit-logger";

// Helper function for consistent error responses
const errorResponse = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

// Helper function for validation
const validateRequired = (fields: Record<string, unknown>) => {
  for (const [key, value] of Object.entries(fields)) {
    if (!value?.toString().trim()) {
      return `Missing required field: ${key}`;
    }
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { title } = await req.json();

    // Enhanced validation
    if (!title || typeof title !== "string") {
      return errorResponse("Missing or invalid title", 400);
    }

    if (title.trim().length === 0) {
      return errorResponse("Title cannot be empty", 400);
    }

    if (title.trim().length > 255) {
      return errorResponse("Title too long (max 255 characters)", 400);
    }

    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: title.trim() })
      .select()
      .single();

    if (error) {
      return errorResponse("Failed to create chat", 500);
    }

    await AuditLogger.log("CHAT_CREATED", user.id, { chat_id: data.id });
    return NextResponse.json({ chat: data });
  } catch {
    return errorResponse("Invalid request", 400);
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data, error } = await supabase
      .from("chats")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return errorResponse("Failed to fetch chats", 500);
    }

    return NextResponse.json({ chats: data || [] });
  } catch {
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { chat_id } = await req.json();

    // Enhanced validation
    if (!chat_id || typeof chat_id !== "string") {
      return errorResponse("Missing or invalid chat_id", 400);
    }

    const { error } = await supabase.rpc("delete_user_chat", {
      p_chat_id: chat_id,
      p_user_id: user.id,
    });

    if (error) {
      return errorResponse(
        error.message.includes("not found")
          ? "Chat not found"
          : "Failed to delete chat",
        error.message.includes("not found") ? 404 : 500
      );
    }

    await AuditLogger.log("CHAT_DELETED", user.id, { chat_id });
    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Invalid request", 400);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { chat_id, title } = await req.json();

    // Enhanced validation
    if (!chat_id || typeof chat_id !== "string") {
      return errorResponse("Missing or invalid chat_id", 400);
    }

    if (!title || typeof title !== "string") {
      return errorResponse("Missing or invalid title", 400);
    }

    if (title.trim().length === 0) {
      return errorResponse("Title cannot be empty", 400);
    }

    if (title.trim().length > 255) {
      return errorResponse("Title too long (max 255 characters)", 400);
    }

    const { data, error } = await supabase
      .from("chats")
      .update({ title: title.trim() })
      .eq("id", chat_id)
      .eq("user_id", user.id)
      .select("id, title")
      .single();

    if (error) {
      return errorResponse("Failed to update chat title", 500);
    }

    if (!data) {
      return errorResponse("Chat not found", 404);
    }

    await AuditLogger.log("CHAT_TITLE_UPDATED", user.id, {
      chat_id,
      title: "[REDACTED]",
    });
    return NextResponse.json({ chat: data });
  } catch {
    return errorResponse("Invalid request", 400);
  }
}
