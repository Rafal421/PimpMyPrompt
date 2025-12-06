"use server";

import { loginUser, signupUser } from "@/app/auth/actions";
import type { ActionResult } from "@/lib/validation";

export async function login(formData: FormData): Promise<ActionResult | void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return loginUser(email, password);
}

export async function signup(formData: FormData): Promise<ActionResult | void> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return signupUser(email, password);
}
