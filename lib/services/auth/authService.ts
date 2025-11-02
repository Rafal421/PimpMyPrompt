"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginSchema, signupSchema, type ValidationError, type ActionResult } from "@/lib/validation";

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_CONFIRMED: "Please check your email and confirm your account",
  USER_EXISTS: "User with this email already exists",
  WEAK_PASSWORD: "Password is too weak",
  INVALID_EMAIL: "Invalid email format",
  SERVER_ERROR: "Server error occurred. Please try again.",
  RATE_LIMIT: "Too many attempts. Please try again later.",
} as const;

const mapSupabaseError = (error: unknown): string => {
  const message = (error as { message?: string })?.message?.toLowerCase() || "";

  if (message.includes("invalid login credentials") || message.includes("invalid email or password")) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }
  if (message.includes("email not confirmed")) {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }
  if (message.includes("user already registered") || message.includes("already exists")) {
    return ERROR_MESSAGES.USER_EXISTS;
  }
  if (message.includes("password should be")) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }
  if (message.includes("invalid email")) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  if ((error as { status?: number })?.status === 429) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

export async function loginUser(email: string, password: string): Promise<ActionResult | void> {
  const supabase = await createClient();

  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const fieldErrors: ValidationError[] = validation.error.errors.map((err) => ({
      field: err.path[0] as string,
      message: err.message,
    }));

    return {
      success: false,
      fieldErrors,
      error: "Please fix the errors below",
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword(validation.data);

    if (error) {
      if (error.status === 400 || error.message.includes("Invalid login credentials") || 
          error.message.includes("Email not confirmed") || error.message.includes("Invalid email or password")) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }
      redirect(`/error?message=${encodeURIComponent("Server error occurred")}`);
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

export async function signupUser(email: string, password: string): Promise<ActionResult | void> {
  const supabase = await createClient();

  const validation = signupSchema.safeParse({ email, password, confirmPassword: password });
  if (!validation.success) {
    const fieldErrors: ValidationError[] = validation.error.errors.map((err) => ({
      field: err.path[0] as string,
      message: err.message,
    }));

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
      if (error.status === 400 || error.status === 422 || error.message.includes("User already registered") ||
          error.message.includes("Password should be") || error.message.includes("Invalid email") ||
          error.message.includes("already exists")) {
        return {
          success: false,
          error: mapSupabaseError(error),
        };
      }
      redirect(`/error?message=${encodeURIComponent("Error occurred during registration")}`);
    }

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

export async function resetPassword(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/confirm?next=${encodeURIComponent("/auth/update-password")}`,
    });

    if (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }

    return {
      success: true,
      message: "Password reset link has been sent.",
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}

export async function updatePassword(password: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    await supabase.auth.signOut();

    return {
      success: true,
      message: "Password updated successfully! Please sign in with your new password.",
    };
  } catch {
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}

export async function logoutUser(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
