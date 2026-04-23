# Screens to Design

Every screen in the dashboard app. Priority order — top to bottom. Each screen notes what the user is doing there, what data it shows (see `03-data-contracts.md`), and any behavior the design needs to account for.

---

## P1 — Must have for June 30

### 1. Dashboard home (`/`)
**What the user does:** Lands here after login. Sees all brand projects they've created. Clicks one to open it, or starts a new one.

**Data shown:** List of `BrandProject` records (see contracts).

**States to design:**
- Empty state (no projects yet) — prominent "Start new brand" call to action
- List state (1+ projects) — each row shows company name, industry, creation date, status badge (`running` / `complete` / `failed`)
- Loading skeleton while fetching

**Actions:** "New brand" button (primary CTA, always visible).

---

### 2. New brand intake — questionnaire mode (`/new`)
**What the user does:** Answers a series of questions about their business. The brief calls for a *conversational* feel — "like a brand strategist, not a form." Think chat-style or step-by-step flow, not a flat grid of inputs.

**Fields to collect** (see `03-data-contracts.md` for exact names and types):
- Company name
- Industry
- Target audience
- Tone of voice (multi-select tags, e.g. "confident, precise, modern")
- Competitors
- Brand archetype (hero / sage / creator / caregiver / explorer / jester / etc.)
- Palette preference (color theory module — the design should suggest 3–4 palettes mapped to the archetype + industry the user picked. User picks one or asks for more.)
- Free-text notes

**States:**
- Step-by-step progression (suggested: multi-step with progress indicator)
- Validation errors inline
- Submitting (disable submit, show "Running the AI…" loading state — this takes seconds for stub, minutes for the real skill)

**After submit:** redirect to `/brands/:id`.

---

### 3. New brand intake — existing brand mode (`/new?mode=existing`)
**What the user does:** Uploads an existing logo, brand guide PDF, and/or pastes their existing website URL. Fills a shorter follow-up questionnaire for gaps.

**Components:**
- File dropzone (logo SVG/PNG, brand guide PDF — multi-file)
- URL input ("We'll scan your existing site to infer your brand")
- "Parsed" preview — once uploads/URL analyzed, show what was detected: colors extracted, fonts detected, hero copy pulled
- Gap-fill form — 3 short questions for anything not detected

**Toggle between modes:** Clear way to switch between "New brand" and "Existing brand" on the `/new` page.

---

### 4. Project panel (`/brands/:id`)
**What the user does:** Sees the outputs of a single brand project. Downloads assets. Toggles lead gen. Checks KPIs (Phase 2).

**Data shown:** One `BrandProject` + its `outputs` object.

**Sections:**
- **Header** — company name, industry, status, created date
- **Brand kit panel** — color swatches (primary, secondary, accent, neutral), typography preview, tone-of-voice pills, positioning statement
- **Downloads** — buttons for: Playbook PDF, Brand JSON, Landing page HTML, Logo SVG (primary + variants)
- **Landing page preview** — embedded iframe or thumbnail + "View live" button (opens deployed URL)
- **Audit score** (Phase 2 — can mock for now) — score 0–100 + gap list
- **Lead gen toggle** (Phase 2 — can mock) — on/off switch, status
- **KPIs** (Phase 2 — can mock) — branding/marketing KPIs only, **no financial data (FINRA)**

**States:**
- Status = `running` — most content hidden/skeleton, show a "Building your brand…" spinner with progress hints
- Status = `complete` — everything populated
- Status = `failed` — error message + retry button

---

### 5. App shell / nav
**Global chrome:**
- Top nav with IEI Ventures logo (left) — *note: the platform's logo is TBD, design a placeholder wordmark*
- User avatar / menu (right) — for auth'd state
- Primary CTA "New brand" in nav
- Footer with minimal links (Docs, GitHub, Contact)

**White-label mode:** When white-labeled, the logo + nav colors swap per tenant (see `03-data-contracts.md` for tenant config shape). Design should accommodate a tenant theme that overrides the default.

---

### 6. Auth screens
**Login, sign-up, password reset.** Keep minimal — we'll use Supabase or Clerk. Main design need is the visual style matches the dashboard.

---

## P2 — Post-MVP, design later

- White-label admin page (agency manages their tenants)
- Billing / subscription settings
- Brand audit standalone page (paste URL → get score, as acquisition funnel)
- Lead gen module UI (radar dashboard, lead list, outreach sequences)
- Venture studio portfolio view

---

## Components the design system should cover

Beyond specific screens, the design system needs these reusable pieces:

- Buttons (primary, secondary, ghost, destructive, icon-only)
- Input, textarea, select, multi-select pills, file dropzone, URL input
- Color swatch card
- Typography preview card
- Status badges (`running`, `complete`, `failed`, `pending`)
- Project card (used in dashboard list)
- Nav header
- Modal / drawer
- Toast / inline notification
- Progress indicator (stepper for intake flow)
- Skeleton loader
