/**
 * Edge middleware — does two things:
 *
 * 1. Tenant resolution: pulls the tenant slug from host (subdomain or custom
 *    domain) or ?tenant= query, forwards as x-iei-tenant so RSC / API can
 *    pick up the active tenant without parsing URLs themselves.
 *
 * 2. Auth route protection: redirects unauthenticated users away from the
 *    app (/ /new /brands) to /login. Session check is cookie-only — the
 *    actual user lookup happens in auth.ts with DB access, which middleware
 *    can't reach. We only check cookie presence here.
 */
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/new", "/brands"];
const PROTECTED_ROOT = new Set(["/"]);
const SESSION_COOKIE = "iei_session";

function isProtected(pathname: string): boolean {
  if (PROTECTED_ROOT.has(pathname)) return true;
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  /* ---- tenant resolution ---- */
  const host = request.headers.get("host") ?? "";
  const queryTenant = request.nextUrl.searchParams.get("tenant");
  const subdomainMatch = host.match(
    /^([a-z0-9-]+)\.(ieiventures\.(?:app|com)|localhost:\d+)$/i
  );
  const subdomain = subdomainMatch?.[1];
  const reserved = new Set(["www", "app", "api"]);
  const fromHost = subdomain && !reserved.has(subdomain) ? subdomain : null;
  const slug = queryTenant ?? fromHost ?? "";
  if (slug) requestHeaders.set("x-iei-tenant", slug);
  requestHeaders.set("x-iei-host", host);

  /* ---- auth gate ---- */
  const { pathname } = request.nextUrl;
  if (isProtected(pathname)) {
    const cookie = request.cookies.get(SESSION_COOKIE);
    if (!cookie?.value) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/brands/.+/files/).*)"],
};
