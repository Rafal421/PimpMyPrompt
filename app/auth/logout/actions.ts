"use server";

import { logoutUser } from "@/app/auth/actions";

export async function logout() {
  return logoutUser();
}
