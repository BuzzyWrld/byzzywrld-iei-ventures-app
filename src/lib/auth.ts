/**
 * Local auth using SQLite + iron-session.
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
import { db } from "./db";

const SESSION_PASSWORD =
  process.env.AUTH_SECRET ??
  "dev-only-insecure-secret-change-in-production-iei-ventures-2026";

if (SESSION_PASSWORD.length < 32) {
  // iron-session requires at least 32 chars.
  throw new Error("AUTH_SECRET must be at least 32 characters");
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

/* ---------- schema ---------- */

let _initialized = false;
function ensureSchema() {
  if (_initialized) return;
  db().exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      tenant_id TEXT NOT NULL DEFAULT 'default',
      created_at TEXT NOT NULL
    );
  `);
  // Add user_id column to brands if missing.
  const cols = (db().prepare(`PRAGMA table_info(brands)`).all() as { name: string }[]).map(
    (c) => c.name
  );
  if (!cols.includes("user_id")) {
    db().exec(`ALTER TABLE brands ADD COLUMN user_id TEXT`);
  }
  _initialized = true;
}

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  tenant_id: string;
  created_at: string;
};

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
  ensureSchema();
  const email = params.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "invalid email" };
  if (params.password.length < 8) return { error: "password must be 8+ chars" };
  const existing = db().prepare(`SELECT id FROM users WHERE email = ?`).get(email) as
    | { id: string }
    | undefined;
  if (existing) return { error: "email already registered" };

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(params.password, 10);
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO users (id, email, password_hash, name, tenant_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(id, email, passwordHash, params.name.trim(), params.tenantId ?? "default", now);

  return {
    user: { id, email, name: params.name.trim(), tenantId: params.tenantId ?? "default", createdAt: now },
  };
}

// Demo credential bypass — Vercel serverless instances each get a fresh /tmp,
// so SQLite data written during signup is invisible to the login invocation.
// These hardcoded values let a known demo account work across all instances
// without any database lookup. The hash is bcrypt(IEIDemo2026!, rounds=10).
// Override via DEMO_USER_EMAIL / DEMO_USER_PASSWORD_HASH env vars if needed.
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
  ensureSchema();
  const email = params.email.trim().toLowerCase();

  // Demo bypass — must check before SQLite since /tmp may be empty.
  if (email === DEMO_USER.email) {
    const hash = process.env.DEMO_USER_PASSWORD_HASH ?? "";
    const ok = await bcrypt.compare(params.password, hash);
    if (!ok) return { error: "invalid credentials" };
    return { user: DEMO_USER };
  }

  const row = db().prepare(`SELECT * FROM users WHERE email = ?`).get(email) as
    | UserRow
    | undefined;
  if (!row) return { error: "invalid credentials" };
  const ok = await bcrypt.compare(params.password, row.password_hash);
  if (!ok) return { error: "invalid credentials" };
  return { user: rowToUser(row) };
}

export function getUserById(id: string): User | null {
  // Demo bypass — the demo user has no SQLite row but must survive page reloads.
  if (id === DEMO_USER.id) return DEMO_USER;

  ensureSchema();
  const row = db().prepare(`SELECT * FROM users WHERE id = ?`).get(id) as UserRow | undefined;
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
const DEV_BYPASS = true;
// ─────────────────────────────────────────────────────────────────────────────

export async function currentUser(): Promise<User | null> {
  if (DEV_BYPASS) return DEMO_USER;
  const s = await getSession();
  if (!s.userId) return null;
  return getUserById(s.userId);
}
