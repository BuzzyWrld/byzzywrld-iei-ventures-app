# Current State — IEI Ventures

**Updated:** 2026-05-27 (post 3-vibe cherry-pick onto main)
**Branch:** `main`
**Latest commit:** `11acfb5` (feat(website): 3 vibe-versions × 3 pages each)

This is the "start here" doc for any new Claude Code session, new hire, or future self trying to figure out what's live and what's in-flight. For a deep map of every reference / skill / file, see `REFERENCE_INDEX.md`. For Tab's confirmed product decisions, see `iei-brand-system/DECISIONS_LOG.md`.

---

## ⚠️ Read first — two parallel migrations happened this week

On 2026-05-26, two independent migrations happened in parallel:

- **On the `content-engine` branch (Henrique's Claude Code session):** Full swap of iron-session + Neon Postgres → Supabase Auth (via `@supabase/ssr`) + Supabase Postgres. Built the 3-vibe website generator. Wired Tab's design IP directly into Phase 2 prompts.
- **On `main` (Ryan / others, in parallel):** Already shipped Google OAuth via Auth.js v5 (`src/lib/next-auth.ts`) layered on top of iron-session + a separate Supabase data layer migration (`src/lib/supabase.ts`).

**On 2026-05-27 we cherry-picked only the 3-vibe work + REFERENCE_INDEX from content-engine onto main.** The Supabase Auth migration (my custom OAuth route, OAuthButtons component, etc.) was NOT brought over because main's Auth.js v5 already does Google OAuth — different library, same outcome. Don't try to merge the auth stacks again.

**The `content-engine` branch is now stale** — refer to `main` for everything except history.

---

## What's live

| Surface | State |
|---|---|
| Production URL | `https://iei-content-engine.vercel.app` — Ryan's Vercel deployment |
| Branch deployed | `main` (Vercel auto-deploys from here) |
| Pricing | $997 (Brand Blueprint Basic), upsells exist — see `iei-brand-system/DECISIONS_LOG.md` |
| Tier 1 deliverables | brand messaging, 3 logo options, brand kit (palette + typography), 3 website *versions* (home/about/flex each, in distinct vibes — 2026-05-27), GTM checklist |
| LLM provider | OpenRouter (one key, account: `admin@ieiventures.com`, key: `iei-ventures-prod`) → routes to Claude 3.7 Sonnet by default |
| Data layer | Supabase Postgres (migrated 2026-05-27) — see `src/lib/db.ts` + `src/lib/supabase.ts` |
| Auth | Auth.js v5 (NextAuth) Google sign-in + iron-session cookie + email/password fallback (bcrypt) — see `src/lib/next-auth.ts` + `src/lib/auth.ts` |

## Architecture quick-reference

```
                          ┌──────────────────────────────────────────────┐
   Customer (browser)     │  Next.js App Router (Vercel)                 │
        │                 │                                               │
        ▼                 │   /login                                       │
   Auth.js v5             │     ├─ Continue with Google → NextAuth flow   │
   (Google OAuth)         │     └─ Email/password → iron-session          │
        │                 │                                               │
        ▼                 │   App routes call src/lib/auth.ts              │
   public.users (Supabase)│     +  src/lib/db.ts (Supabase JS client)      │
   with oauth_provider    │     +  src/lib/skill.ts (brand-build agent)    │
        │                 │                                               │
        ▼                 │   Brand assets (HTML, SVGs, JSON outputs)      │
   public.brands etc.     │     → src/lib/storage.ts → Vercel Blob         │
   (Supabase Postgres)    └──────────────────────────────────────────────┘

  Brand build (Phase 1 + Phase 2):
    1. Customer answers questionnaire → /new
    2. Lock-In → src/lib/chat-intake.ts::synthesizeFoundation → IEIBrandFoundation JSON
    3. enqueueBrandBuild(intake) → runPhase1 → brand-playbook skill agent
         (loads skills/brand-playbook/SKILL.md + references/* via auto-glob)
    4. After Phase 1, runPhase2 fans out to variant generators in src/lib/variants/
         landing (3 vibes × 3 pages = 9 outputs)
         pitch | dev-brief | social | email | brand-video | palette-expand
    5. Outputs are written to disk then assetUrl'd into the manifest stored on the brand
    6. /brands/[id] page renders the kit; 3 website versions show as a picker

  NOTE: Phase 2 variant generators do NOT auto-load the references/ tree.
  That auto-glob runs ONLY for the Phase 1 skill agent. landing.ts injects
  vibe profile + Tab voice rules + ship-quality bar DIRECTLY into its
  callClaude prompt. See src/lib/variants/landing.ts + vibes.ts.
```

## What's pending

### Critical (production is currently broken without this)

1. **Run Ryan's SQL in Supabase** to create the `users` + `tenants` tables. Ryan's code on main (`a1c30b2`) expects these tables and they don't exist yet. SQL is in his message at the top of session #X (paste into Supabase SQL Editor at <https://supabase.com/dashboard/project/lyqhtybsjbbyshgqtome/sql/new>):

   ```sql
   CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT,
     name TEXT NOT NULL,
     tenant_id TEXT NOT NULL DEFAULT 'default',
     created_at TEXT NOT NULL,
     oauth_provider TEXT,
     oauth_provider_account_id TEXT,
     image TEXT
   );

   CREATE TABLE IF NOT EXISTS tenants (
     id TEXT PRIMARY KEY,
     slug TEXT UNIQUE NOT NULL,
     display_name TEXT NOT NULL,
     logo_url TEXT,
     colors_json TEXT NOT NULL,
     custom_domain TEXT
   );
   ```

2. **Redeploy on Vercel** after Ryan ran his migration — `vercel --prod`. Then test login at <https://iei-content-engine.vercel.app/login>.

### Other pending tasks (TaskList)

- `#23` — Build the IEI Ventures intro video with Higgsfield (MCP connected + authenticated; needs session restart to load tools).
- `#25` — Add Apple Sign-In as a third OAuth provider (dropped from v1 because Services ID + .p8 + JWT rotation is materially more friction than Google).

### Open follow-ups

- **DM Tab** about the 3-vibe override. Her 2026-05-21 spec said *one* 3-page website; we now ship *three* 3-page websites (one per vibe). See `iei-brand-system/DECISIONS_LOG.md` → "WEBSITE DELIVERABLE — 3 VIBE VERSIONS" section.
- The `content-engine` branch is stale — consider deleting it once you're sure nothing on it is needed.
- Local dev typecheck shows pre-existing errors in `src/lib/store.ts` (implicit any) and missing modules in `tests/security.test.ts` / `vitest.config.ts`. Not blocking but worth cleaning up.

### Known gaps (not blocking)

- `src/lib/content-engine-runner.ts` still writes pass outputs to `/tmp` without publishing to Blob.
- Email provider — every send is stubbed. Look for `[email-stub]` console logs and `TODO(email)` comments.
- Stripe refund API — `decline-refund` flips status but doesn't call `stripe.refunds.create()`.

## What NOT to do

- **Don't try to merge `content-engine` into `main` again.** The 3-vibe work is already on main as of `11acfb5`. The rest of content-engine (Supabase Auth, custom OAuth route, OAuthButtons component) is duplicate of main's Auth.js v5 setup and would conflict.
- **Don't add @supabase/ssr to package.json on main.** Main uses `@supabase/supabase-js` directly via `src/lib/supabase.ts`. The two libraries are different.
- **Don't reintroduce `iron-session` removal logic.** Main intentionally keeps iron-session for the session cookie alongside Auth.js v5. They work together.
- **Don't assume the `references/` auto-load reaches Phase 2.** The auto-glob runs ONLY for the Phase 1 skill agent. Phase 2 variant generators have to inject what they need directly (see `landing.ts` for the pattern).
- **Don't ship without a Tab-in-the-loop review** for early customers. Auto-acceptance is gated by the brand-kit walkthrough UI (per DECISIONS_LOG.md).

## Useful pointers

- `docs/REFERENCE_INDEX.md` — every reference / skill / doc mapped to where it lives + what loads it
- `docs/iei-brand-system/DECISIONS_LOG.md` — confirmed product decisions, in date order
- `skills/brand-playbook/references/design-anatomy.md` — Tab's recipe book (the FIVE FLAVORS, the 22-design dissection)
- `skills/brand-playbook/references/iei-voice-rules.md` — voice rules + banned vocab + proprietary phrases
- `src/lib/variants/landing.ts` + `src/lib/variants/vibes.ts` — the 3-vibe website generator (NEW 2026-05-27)
- `src/lib/db.ts` + `src/lib/supabase.ts` — Supabase data layer
- `src/lib/next-auth.ts` — Auth.js v5 Google OAuth config
- `src/lib/auth.ts` — iron-session + bcrypt fallback for email/password sign-in
