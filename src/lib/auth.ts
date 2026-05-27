/**
 * Local auth using Neon Postgres + iron-session.
 *
 * Self-hosted on our Next.js server — no Supabase/Clerk external service.
 * Easy to migrate later: the `user_id` shape stays compatible.
 *
 * Usage:
 *   signUp({ email, password, name, tenantId })  -> creates user, returns id
 *   signIn({ email, password })                  -> returns user or null
 *   getSession()                                 -> current session from cookie
 *   setSession(userId) / clearSession()          -> cookie helpers
 */
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { findUserByEmail, findUserById, createUser, type UserRow } from "./db";

const SESSION_PASSWORD =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  "dev-only-insecure-secret-change-in-production-iei-ventures-2026";

if (SESSION_PASSWORD.length < 32) {
  throw new Error("NEXTAUTH_SECRET must be at least 32 characters");
}

const COOKIE_NAME = "iei_session";
const SESSION_OPTS: SessionOptions = {
  cookieName: COOKIE_NAME,
  password: SESSION_PASSWORD,
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export type SessionData = {
  userId?: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  createdAt: string;
};

/* ---------- helpers ---------- */

const rowToUser = (r: UserRow): User => ({
  id: r.id,
  email: r.email,
  name: r.name,
  tenantId: r.tenant_id,
  createdAt: r.created_at,
});

/* ---------- auth operations ---------- */

export async function signUp(params: {
  email: string;
  password: string;
  name: string;
  tenantId?: string;
}): Promise<{ user?: User; error?: string }> {
  const email = params.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalid email" };
  if (params.password.length < 8) return { error: "password must be 8+ chars" };
  const existing = await findUserByEmail(email);
  if (existing) return { error: "email already registered" };

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(params.password, 10);
  const now = new Date().toISOString();
  await createUser({
    id,
    email,
    passwordHash,
    name: params.name.trim(),
    tenantId: params.tenantId ?? "default",
    createdAt: now,
  });

  return {
    user: { id, email, name: params.name.trim(), tenantId: params.tenantId ?? "default", createdAt: now },
  };
}

// Demo credential bypass — hardcoded values let a known demo account work
// across all instances without any database lookup. The hash is
// bcrypt(IEIDemo2026!, rounds=10). Override via env vars if needed.
const _DEMO_EMAIL = (process.env.DEMO_USER_EMAIL ?? "demo@ieiv.co").trim().toLowerCase();
const _DEMO_HASH =
  process.env.DEMO_USER_PASSWORD_HASH ??
  "$2b$10$3yfGcPC7rkHqh84iQGi8TO5.ipQhTAzSryNFPwZWL7q7ZrA569Km2";

const DEMO_USER: User = {
  id: "demo-user",
  email: _DEMO_EMAIL,
  name: "Demo User",
  tenantId: "default",
  createdAt: "2026-01-01T00:00:00.000Z",
};

export async function signIn(params: {
  email: string;
  password: string;
}): Promise<{ user?: User; error?: string }> {
  const email = params.email.trim().toLowerCase();

  // Demo bypass.
  if (email === DEMO_USER.email) {
    const ok = await bcrypt.compare(params.password, _DEMO_HASH);
    if (!ok) return { error: "invalid credentials" };
    return { user: DEMO_USER };
  }

  const row = await findUserByEmail(email);
  if (!row) return { error: "invalid credentials" };
  const ok = await bcrypt.compare(params.password, row.password_hash);
  if (!ok) return { error: "invalid credentials" };
  return { user: rowToUser(row) };
}

export async function getUserById(id: string): Promise<User | null> {
  // Demo bypass — the demo user has no DB row but must survive page reloads.
  if (id === DEMO_USER.id) return DEMO_USER;

  const row = await findUserById(id);
  return row ? rowToUser(row) : null;
}

/* ---------- session (cookie) ---------- */

export async function getSession(): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(await cookies(), SESSION_OPTS);
}

export async function setSession(userId: string): Promise<void> {
  const s = await getSession();
  s.userId = userId;
  await s.save();
}

export async function clearSession(): Promise<void> {
  const s = await getSession();
  s.destroy();
}

// ─── TESTING BYPASS ──────────────────────────────────────────────────────────
// Set to true to skip login for all routes during local/staging testing.
// Flip back to false before going live with real users.
const DEV_BYPASS = process.env.DEV_BYPASS === "true";
// ─────────────────────────────────────────────────────────────────────────────

export async function currentUser(): Promise<User | null> {
  if (DEV_BYPASS) return DEMO_USER;
  const s = await getSession();
  if (!s.userId) return null;
  return getUserById(s.userId);
}
