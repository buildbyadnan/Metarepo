import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "session";

/**
 * Next.js 16 proxy (formerly middleware) — runs at the network boundary
 * before routes render. Session-cookie guard for the auth-only areas.
 * Waitlist approval state is checked client-side via /auth/me.
 */
export function proxy(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/waitlist")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/waitlist"],
};
