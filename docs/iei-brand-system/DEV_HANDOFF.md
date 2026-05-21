# Dev Team Handoff — Brand Blueprint

**Audience:** Tab's developer team picking up the technical pieces.
**Read this first.** It maps everything in `docs/iei-brand-system/` to concrete code work, calls out what's already built vs. what's new, and gives you the phased plan.

---

## 🚨 Critical orientation

1. **Read `AGENTS.md` at repo root before writing code.** It says: *"This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code."* — Heed this. Don't trust your default Next.js intuition.
2. **The product is "Brand Blueprint" under parent "IEI Ventures."** Never call the product anything else in code, comments, env vars, or commits. Domain: `ieiventures.com`.
3. **MVP target: 5-7 working days to first paying customer.** The bottleneck is legal turnaround, not code. Don't over-engineer.
4. **Stage 1 is CONCIERGE.** Tab manually runs every intake (Zoom), reviews every output, and emails delivery. We are NOT building autonomous customer flow yet. See `STAGE1_LAUNCH_PLAN.md`.

---

## 📁 What lives where

```
docs/iei-brand-system/
  PRODUCT_FRAMING.md          ← THE source of truth on what Brand Blueprint is
  STAGE1_LAUNCH_PLAN.md       ← The 30-day plan with cost budget
  LEGAL_CHECKLIST.md          ← Brief for attorney call
  DECISIONS_LOG.md            ← Every confirmed product decision
  DEV_HANDOFF.md              ← (this file)
  BRAND_VOICE_SPEC.md         ← AI voice rules with do/don't examples
  SKILL_UPDATE.md             ← Specific edits to skills/brand-playbook/SKILL.md
  OPERATIONAL_DASHBOARD.md    ← Notion/Airtable layout for Tab
  source/                     ← Original .docx extracts (the IP — server-only)
  launch-assets/
    legal/
      TERMS_OF_SERVICE.md     ← Plain-English draft for attorney
      PRIVACY_POLICY.md       ← Plain-English draft for attorney
      IP_CLICKTHROUGH.md      ← Plain-English draft for attorney
    landing-page-copy.md      ← Full copy for the landing site
    tab-video-script.md       ← 90-sec + 30-sec scripts
    intake-call-script.md     ← Tab's 60-min Zoom flow
    tier-review-checklists.md ← QC pass per tier
    email-templates.md        ← All customer-facing emails
```

---

## 🧱 What already exists in the codebase (DO NOT REBUILD)

```
src/
  lib/
    skills/
      agent-sdk.ts             ← Anthropic Agent SDK adapter — WORKS, just add brandSoul threading
      contract.ts              ← Skill interface
      content-engine.ts        ← Content engine variant (Stage 2+ relevant)
    variants/                  ← Logo / landing / palette variants — KEEP
    blob-brands.ts             ← Brand persistence (blob store) — KEEP
    blob-runs.ts               ← Run tracking — KEEP
    auth.ts                    ← Auth helpers — KEEP
    db.ts                      ← DB connection — KEEP
    pdf.ts                     ← HTML → PDF rendering — KEEP
    storage.ts                 ← File storage — KEEP
    types.ts                   ← BrandIntake + BrandJson types — EXTEND, don't replace
    industries.ts              ← Industry direction picker — KEEP
    skill.ts                   ← Skill registry — KEEP

  app/
    new/                       ← Existing intake form (deep mode lives here) — KEEP, eventually replace UI
    api/
      brands/                  ← POST/GET brands — KEEP
      brands/[id]/             ← Brand-detail routes — KEEP
      scrape/                  ← URL scraping (for existing-brand path) — KEEP
      uploads/                 ← File uploads — KEEP

skills/
  brand-playbook/
    SKILL.md                   ← Main skill prompt — UPDATE per SKILL_UPDATE.md
    references/                ← Worksheets, archetypes, color theory — KEEP, ADD IEI references
```

**Don't touch:** anything in `content-engine/`, `logos/`, `variants/`, `uploads/` unless explicitly asked. Those work.

---

## 🆕 What's NEW (days 1-7 build sequence)

### Day 1 — Foundation + Legal package

**Owner: Tab + Claude (parallel; no dev work yet)**
- [ ] Tab books attorney call (Task #4)
- [ ] Tab files USPTO trademarks (Task #5)
- [ ] Tab picks pricing (Option A / B / C) — affects Stripe + landing copy

### Days 1-3 — Landing site (Task #2)

**Owner: Dev team OR Tab if no-code preferred**

**Decision needed Day 1:** Build path:
- **Path A (recommended):** Framer or Webflow no-code build. 1-2 days. $25-40/mo. Tab can edit later.
- **Path B:** Custom Next.js page in existing repo. 3-4 days. Free hosting. Engineers maintain.

If Path A → done by Day 3, dev team starts Day 4 work.
If Path B → in this repo, create `src/app/blueprint/page.tsx` per `landing-page-copy.md`. Mobile-first. Tailwind. Wire 3 buttons to 3 Stripe Payment Links (URLs come from Tab after Task #3).

### Day 2 — Stripe Payment Links (Task #3)

**Owner: Tab (no dev needed)**
- 3 Payment Links via Stripe Dashboard
- Post-payment redirect = Calendly intake-call booking URL
- IP-clickthrough checkbox enabled (Stripe supports custom fields)
- Metadata: `tier=basic|content|full`, `product=brand-blueprint`

**Dev note:** No webhooks yet. We'll add `POST /api/stripe/webhook` in Days 8-30 to auto-provision brand projects. For Stage 1 manual flow, Tab gets Stripe email → manually creates brand project via existing `/new/deep` form.

### Days 3-5 — Run an end-to-end test (Task #7)

**Owner: Tab + 1 friendly customer**
- Use existing `/new/deep` flow as the intake form (Tab types in what came up on Zoom)
- Existing `agent-sdk.ts` generates outputs (per current SKILL.md)
- Tab reviews per `tier-review-checklists.md`
- Tab packages + emails per `email-templates.md`

**Dev work needed for test:** Probably none. The existing flow should work end-to-end with Tab manually triggering each step. If something breaks, fix only that thing — don't refactor.

### Day 5+ — Soft launch

**Owner: Tab**
- DM/email 20 warm prospects with landing URL

---

## 🛠 Days 8-30 build (after first 2-3 paying customers)

### Task #8 — Conversational chat intake

**Spec:** See `CHAT_STATE.md` (in repo root) — but **reframe per IEI Brand System.** The 7 generic categories in CHAT_STATE.md should be REPLACED with Tab's 6 modules:

1. One Brilliant Idea
2. Who Are You? (ABCs)
3. Who Are They?
4. What Do They Need? (Offering)
5. The Narrative
6. Content & Comms

Each module has a "TAB SAYS" anchor question (use Tab's verbatim language from `intake-call-script.md`), 0-2 adaptive follow-ups, and ends with a "Lock It In" moment.

**Routes to create:**
```
src/app/chat/start/page.tsx        ← Path picker: "new brand" or "improve existing"
src/app/chat/[sessionId]/page.tsx  ← Chat UI (server-rendered initially, no SSE)
src/app/api/chat/start/route.ts
src/app/api/chat/turn/route.ts     ← One turn = one Claude call
src/app/api/chat/[sessionId]/complete/route.ts
```

**Persistence:** Blob store, same pattern as `blob-brands.ts`. New file: `src/lib/blob-chat-sessions.ts`.

**Model:** Haiku for each turn (cheap, fast). Sonnet only for the synthesis step (Task #9).

**Effort:** 3-4 dev days.

### Task #9 — Synthesis bridge

**Spec:** See `SYNTHESIS_PROMPT.md` (in repo root) — but REFRAME per IEI Brand System. The synthesis output should be structured as:

```ts
type IEIBrandFoundation = {
  // From Module 1
  brilliantIdea: { iLove: string; iAmGoodAt: string; theMarriage: string };
  // From Module 2
  whoYouAre: { identity: string; story: string; mission: string; voice: string; secretSauce: string };
  oneLine: string;  // "I help X do Y so they can Z"
  taglineOptions: string[];  // 3
  igBioOptions: string[];    // 3
  // From Module 3
  idealClient: { demographics: {...}; psychographics: {...}; dream100Lite: {...} };
  // From Module 4 (6-part offering)
  offering: { who; problem; what; inputs; deliverables; outcome; price };
  offerStatement: string;    // "I offer X for Y..."
  // From Module 5 (7-part narrative)
  narrative: { origin; why; struggle; turningPoint; whoYouServe; howYouHelp; theInvitation };
  hookLine: string;
  // Cross-cutting
  proprietaryPhrases: Array<{ phrase: string; useCase: string }>;
  archetype: { primary: string; secondary: string };
};
```

**Route:** `src/app/api/synthesize/route.ts` — one Sonnet call, ~$0.05/brand, persists `brandFoundation` to BrandProject.

**Review screen:** `src/app/review/[brandId]/page.tsx` — user edits each section, clicks "Generate Brand Blueprint."

**Effort:** 2 dev days.

### Task #10 — Customer feedback capture

**Spec:** Embed exit-survey link in delivery email (Tally or Typeform). Track NPS + testimonial opt-ins. Feed into `OPERATIONAL_DASHBOARD.md` (Notion or Airtable).

**Effort:** 0.5 day.

---

## 🔐 Critical IP protection rules

Per Tab's explicit flag, IP protection is non-negotiable. Engineering rules:

1. **`docs/iei-brand-system/source/` is the proprietary IP.** Never include those files in any LLM prompt that gets cached server-side or exposed client-side. Use them as REFERENCE for building prompts, not as content in prompts.
2. **SKILL.md (server-side only).** The brand-playbook skill prompt loads `SKILL.md` into the Anthropic call. That's fine — Anthropic commercial terms confirm no training on commercial-tier data. But never expose the SKILL.md content to the client browser.
3. **Customer-facing prompts must NEVER include verbatim "TAB SAYS" facilitator script.** Use abstracted voice rules from `BRAND_VOICE_SPEC.md` instead.
4. **Customer intake content stays server-side.** Never leak one customer's intake into another customer's generation.
5. **Anonymize where possible** before sending to AI. Customer name + business name can stay (needed for output personalization), but specific personal stories should be processed carefully.

---

## 💰 Anthropic API spend estimates

| Phase | Calls per brand | Model mix | Cost estimate |
|---|---|---|---|
| Chat intake (15-25 turns) | 15-25 | Haiku | $0.02-$0.05 |
| Synthesis bridge | 1 | Sonnet | $0.05 |
| Brand-playbook generation | 1 (multi-turn agent) | Sonnet or Haiku | $0.25-$1.50 |
| Logo variants | 3-6 | Haiku | $0.10-$0.30 |
| Landing variants | 1-3 | Haiku | $0.05-$0.15 |
| **Total per brand** | — | mixed | **$0.50-$2.00** |

Add 50% buffer for retries + iteration during refinement pass. Budget **$1-$3 per Brand Blueprint sold.**

Caching: enable Anthropic prompt caching on the long SKILL.md + references. Saves ~30-40% on cost when running multiple brands in close succession.

---

## 🚦 Build sequence priority (if dev team is single-threaded)

If you have ONE dev for 30 days, do tasks in this order:

1. **Landing site** (Days 1-3) — biggest unblocker for sales
2. **Stripe webhook + auto-provision brand project** (Day 4) — removes Tab's manual ops between checkout and intake
3. **Chat intake UI** (Days 5-9) — frees Tab from doing every intake call
4. **Synthesis bridge** (Days 10-12) — quality leap
5. **Customer dashboard** (Days 13-16) — view deliverables, request tweaks
6. **SKILL.md updates per SKILL_UPDATE.md** (Day 17) — improves all generation
7. **Cohort-mode skeleton** (Days 18-25) — preps Stage 2

Skip anything not on this list unless Tab explicitly asks. Resist scope creep.

---

## ⚠️ Known risks for engineering

| # | Risk | Mitigation |
|---|---|---|
| 1 | Non-standard Next.js per AGENTS.md — your training data may be wrong | Always check `node_modules/next/dist/docs/` first |
| 2 | Disk-space pressure on Tab's Surface Pro 7 (we've hit 100% twice) | Push CI/builds to remote; keep node_modules on external SSD if she's coding locally |
| 3 | IP-leak via prompt injection from hostile customer | Sanitize intake; never echo customer input back to AI without escaping |
| 4 | Anthropic rate limits at scale | Implement exponential backoff + retry; queue if needed |
| 5 | Brand soul block makes prompts very long | Use prompt caching; monitor token costs |
| 6 | Customer asks for refund after intake call | TOS says no refund post-intake; surface this in checkout copy clearly |
| 7 | "Tab review" bottleneck at 6+ customers/week | Tasks #8 + #9 reduce per-customer Tab time from ~2 hrs to ~45 min |

---

## 📞 When in doubt

- Decisions Log: `docs/iei-brand-system/DECISIONS_LOG.md`
- Product framing: `docs/iei-brand-system/PRODUCT_FRAMING.md`
- Voice rules: `docs/iei-brand-system/BRAND_VOICE_SPEC.md`
- Tab: twolod@ieiagency.com

If you find yourself making a product decision the docs don't cover — STOP and ask Tab. The docs are intentionally specific. Empty space = decision not made yet, not "use your judgment."
