"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  loginSchema,
  signupSchema,
  type ValidationError,
  type ActionResult,
} from "@/lib/validation";
import { AuditLogger } from "@/lib/audit-logger";
import { ERROR_MESSAGES, mapSupabaseError } from "@/app/auth/actions";

export async function loginUser(
  email: string,
  password: string
): Promise<ActionResult | void> {
  const supabase = await createClient();

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors: ValidationError[] = validation.error.errors.map(
      (err) => ({
        field: err.path[0] as string,
        message: err.message,
      })
    );

    return {
      success: false,
      fieldErrors,
      error: "Please fix the errors below",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(validation.data);

    if (error) {
      await AuditLogger.log("LOGIN_FAILED", validation.data.email, {
        error_type: error.message,
      });
      if (
        error.status === 400 ||
        error.message.includes("Invalid login credentials") ||
        error.message.includes("Email not confirmed") ||
        error.message.includes("Invalid email or password")
      ) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }
      redirect(`/error?message=${encodeURIComponent("Server error occurred")}`);
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await AuditLogger.log("LOGIN_SUCCESS", user.id);
    }

    revalidatePath("/private", "layout");
    redirect("/private");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}

export async function signupUser(
  email: string,
  password: string
): Promise<ActionResult | void> {
  const supabase = await createClient();

  const validation = signupSchema.safeParse({
    email,
    password,
    confirmPassword: password,
  });
  if (!validation.success) {
    const fieldErrors: ValidationError[] = validation.error.errors.map(
      (err) => ({
        field: err.path[0] as string,
        message: err.message,
      })
    );

    return {
      success: false,
      fieldErrors,
      error: "Please fix the errors below",
    };
  }

  try {
    const { error } = await supabase.auth.signUp({
      email: validation.data.email,
      password: validation.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      await AuditLogger.log("SIGNUP_FAILED", validation.data.email, {
        error_type: error.message,
      });
      if (
        error.status === 400 ||
        error.status === 422 ||
        error.message.includes("User already registered") ||
        error.message.includes("Password should be") ||
        error.message.includes("Invalid email") ||
        error.message.includes("already exists")
      ) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }
      redirect(
        `/error?message=${encodeURIComponent(
          "Error occurred during registration"
        )}`
      );
    }

    await AuditLogger.log("SIGNUP_SUCCESS", validation.data.email);
    return {
      success: true,
      message: "Check your email to confirm your account",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}
