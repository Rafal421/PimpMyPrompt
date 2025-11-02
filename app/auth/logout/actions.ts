"use server";

import { logoutUser } from "@/lib/services/auth/authService";

export async function logout() {
  return logoutUser();
}
