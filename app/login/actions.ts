"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  loginSchema,
  signupSchema,
  type ValidationError,
  type ActionResult,
} from "@/lib/validation";

// Error messages mapping for better UX
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "Nieprawidłowy email lub hasło",
  EMAIL_NOT_CONFIRMED: "Sprawdź swoją skrzynkę email i potwierdź konto",
  USER_EXISTS: "Użytkownik z tym emailem już istnieje",
  WEAK_PASSWORD: "Hasło jest zbyt słabe",
  INVALID_EMAIL: "Nieprawidłowy format email",
  SERVER_ERROR: "Wystąpił błąd serwera. Spróbuj ponownie.",
  RATE_LIMIT: "Zbyt wiele prób. Spróbuj ponownie za chwilę.",
} as const;

const mapSupabaseError = (error: any): string => {
  const message = error.message?.toLowerCase() || "";

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid email or password")
  ) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (message.includes("email not confirmed")) {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }

  if (
    message.includes("user already registered") ||
    message.includes("already exists")
  ) {
    return ERROR_MESSAGES.USER_EXISTS;
  }

  if (message.includes("password should be")) {
    return ERROR_MESSAGES.WEAK_PASSWORD;
  }

  if (message.includes("invalid email")) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }

  if (error.status === 429) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
};

export async function login(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // Validate input
  const validation = loginSchema.safeParse(rawData);
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
      error: "Popraw błędy poniżej",
    };
  }

  const data = validation.data;

  try {
    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      // Handle known authentication errors
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

      // Log unexpected errors for debugging
      console.error("Unexpected login error:", error);
      redirect(`/error?message=${encodeURIComponent("Wystąpił błąd serwera")}`);
    }

    // Success - revalidate and redirect
    revalidatePath("/private", "layout");
    redirect("/private");
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}

export async function signup(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate input
  const validation = signupSchema.safeParse(rawData);
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
      error: "Popraw błędy poniżej",
    };
  }

  const { email, password } = validation.data;

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      // Handle known registration errors
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

      // Log unexpected errors for debugging
      console.error("Unexpected signup error:", error);
      redirect(
        `/error?message=${encodeURIComponent(
          "Wystąpił błąd podczas rejestracji"
        )}`
      );
    }

    // Success - return success result instead of redirect
    return {
      success: true,
      message: "Sprawdź swoją skrzynkę email aby potwierdzić konto",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.SERVER_ERROR,
    };
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
