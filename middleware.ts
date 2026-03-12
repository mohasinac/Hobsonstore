import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Paths that require a Firebase __session cookie (after locale prefix is stripped)
const PROTECTED_LOCALE_PATHS = ["/admin", "/account"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip next-intl for Next.js internals, static files, and API routes
  const isInternal =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/seed") ||
    /\.(.+)$/.test(pathname); // static files with extension

  if (isInternal) return NextResponse.next();

  // Strip locale prefix (en is default/unprefixed; hi has /hi prefix)
  const localePrefixRe = /^\/hi(\/|$)/;
  const strippedPath = localePrefixRe.test(pathname)
    ? pathname.replace(/^\/hi/, "") || "/"
    : pathname;

  // Session guard for protected paths
  const isProtected = PROTECTED_LOCALE_PATHS.some((p) => strippedPath.startsWith(p));
  if (isProtected) {
    const session = req.cookies.get("__session")?.value;
    if (!session) {
      // Redirect to /login (or /hi/login) preserving locale
      const isHi = localePrefixRe.test(pathname);
      const loginUrl = new URL(isHi ? "/hi/login" : "/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Let next-intl handle locale detection and redirects
  return intlMiddleware(req);
}

export const config = {
  matcher: [
    // Match all paths except static/api
    "/((?!_next|api|seed|.*\\..*).*)",
  ],
};
