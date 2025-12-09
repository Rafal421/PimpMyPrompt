import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/private/:path*", 
    "/settings/:path*", 
    "/api/:path*",
    "/login", 
    "/sign-in", 
    "/sign-up"
  ],
};
