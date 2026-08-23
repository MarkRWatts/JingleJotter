import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/signin", "/privacy"];
// Auth.js names the database-session cookie differently depending on
// whether secure cookies are in play (https / production).
const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

// Optimistic only — checks cookie presence, never hits the DB (this runs on
// every request, including prefetches, and must stay edge-safe — no Prisma
// adapter import here). Real authorization happens via auth() in server
// components/route handlers, which checks the session against the database.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!isPublic && !authenticated) {
    const signInUrl = new URL("/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }
  // NOTE: no cookie-based redirect AWAY from /signin here. A stale or
  // foreign session cookie (e.g. another app's localhost dev cookie —
  // cookies aren't port-scoped) would pass the optimistic check but fail
  // the real auth() in the page, bouncing /signin → / → /signin forever.
  // The signed-in-already redirect lives in app/signin/page.tsx, where
  // auth() validates the session against the database.
  return NextResponse.next();
}

// /api/auth/* must stay reachable (Auth.js's own routes — needed to sign in
// at all); static assets and the brand logo used on the sign-in page must
// stay public too.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|brand|favicon.ico).*)"],
};
