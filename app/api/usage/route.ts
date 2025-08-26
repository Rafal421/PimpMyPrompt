import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check current usage without incrementing
    const { data, error } = await supabase.rpc("check_user_request_count", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error checking usage:", error);
      return NextResponse.json(
        { error: "Failed to check usage" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Increment usage count (this happens when user selects final model)
    const { data, error } = await supabase.rpc("increment_user_request_count", {
      p_user_id: user.id,
    });

    if (error) {
      console.error("Error incrementing usage:", error);
      return NextResponse.json(
        { error: "Failed to update usage" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Usage increment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
