"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/utils/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .max(100, "Password cannot be more than 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ValidationError = {
  field: string;
  message: string;
};

type ActionResult = {
  success?: boolean;
  error?: string;
  fieldErrors?: ValidationError[];
};

export async function login(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

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
      error: "Please fix the errors below",
    };
  }

  const data = validation.data;

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("Email not confirmed") ||
      error.message.includes("Invalid email or password") ||
      error.status === 400
    ) {
      return { success: false, error: error.message };
    }

    redirect(`/error?message=Server error occurred`);
  }

  revalidatePath("/private", "layout");
  redirect("/private");
}

export async function signup(formData: FormData): Promise<ActionResult | void> {
  const supabase = await createClient();

  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

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
      error: "Please fix the errors below",
    };
  }

  const { email, password } = validation.data;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (
      error.message.includes("User already registered") ||
      error.message.includes("Password should be") ||
      error.message.includes("Invalid email") ||
      error.message.includes("already exists") ||
      error.status === 400 ||
      error.status === 422
    ) {
      return { success: false, error: error.message };
    }

    redirect(`/error?message=Registration error occurred`);
  }

  redirect("/login?message=Check your email to confirm account");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
