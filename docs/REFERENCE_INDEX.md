# Reference Index — Where Everything Lives

This is the map. If you (or any Claude agent) ever ask "where is X?" — answer here. Updated 2026-05-26.

## TL;DR — the three layers
1. **Brand-build runtime** (`skills/brand-playbook/`) — what the AGENT loads when generating a customer brand kit. Auto-globbed at build time.
2. **Reference IP** (`docs/iei-brand-system/`) — Tab's canonical workspace. Source of truth for taste, voice, methodology, design intelligence. Some files are mirrored into the runtime layer by `scripts/sync-skill-refs.mjs`.
3. **Team Claude skills** (`tools/claude-skills/`) — personal skills installable to `~/.claude/skills/` so teammates' Claude Code editors have the same design taste and effect libraries you do.

---

## Layer 1: Brand-Build Runtime (what the agent reads on every build)

Path: `skills/brand-playbook/references/` (auto-globbed by both LLM adapters: `src/lib/skills/openai-compat.ts` and `agent-sdk.ts`).

| File | What it is | Source |
|---|---|---|
| `RUNBOOK.md` | The one-process loader doc — how to add a new reference | Skill-internal |
| `iei-brand-system.md` | IEI methodology (6 modules + Fourfold Path + LOCK IT IN statements) | Skill-internal |
| `iei-voice-rules.md` | Voice rules, banned vocab, proprietary phrases | **Mirror** of `docs/iei-brand-system/BRAND_VOICE_SPEC.md` |
| `visual-references.md` | Tab's authoritative taste catalog (26-piece review + brand-by-brand mappings) | **Mirror** of `docs/iei-brand-system/VISUAL_REFERENCES.md` |
| `design-anatomy.md` | **The recipe book.** 22-design dissection + the FIVE FLAVORS (Activist Community Recruiting / Type-as-Art / Vintage Diaspora Poster / Editorial Density / Pattern-as-Branding). Tab's portfolio (floor) + aspirational ceiling. | **Mirror** of `docs/iei-brand-system/DESIGN_ANATOMY.md` |
| `tabs-story.md` | Tab's long-form brand story — voice context for the agent | **Mirror** of `docs/iei-brand-system/TABS_STORY.md` |
| `tab-review-rubric.md` | The structured rubric Tab grades brand kits against. Agent uses for SELF-REVIEW before emitting. | **Mirror** of `docs/iei-brand-system/launch-assets/tab-review-prompt.md` |
| `tier-review-checklists.md` | Per-output quality bars for ship-quality | **Mirror** of `docs/iei-brand-system/launch-assets/tier-review-checklists.md` |
| `design-taste.md` | Synthesis of the 5 design skills' rules (anti-AI-tells). Subordinate to `visual-references.md` when they conflict. | Skill-internal synthesis from `docs/iei-brand-system/design-skills/` |
| `brand-archetypes.md` | The 12 archetypes + recipes | Skill-internal |
| `color-theory.md`, `logo-theory.md`, `social-sizes.md`, `worksheets.md`, `industries.json` | Generic playbook references | Skill-internal |
| `exemplars/INDEX.md` + per-exemplar files | Vibe-first exemplar routing (mantle / wone / pen2purpose / famfit / acetv / banger / offscript / vent) | Skill-internal |
| `patterns/*.md` | Messaging-voice / audience-personas / offer-frameworks patterns | Skill-internal |

**Adding a new reference for the agent:**
- If Tab owns it (lives canonically in `docs/iei-brand-system/`): add a `MIRRORS` entry in `scripts/sync-skill-refs.mjs`. Next `npm run dev`/`build` mirrors it.
- If it's purely skill-internal: drop a `.md` anywhere under `skills/brand-playbook/references/`. The auto-glob picks it up. No code change needed.

---

## Layer 2: Reference IP — Tab's canonical workspace

Path: `docs/iei-brand-system/`. **Source of truth** for everything human-facing. Some files get mirrored into Layer 1.

### Strategy / framing
| File | What |
|---|---|
| `README.md` | Index of this tree |
| `HYBRID_PIVOT.md` | The $997 upfront / 7-day-money-back pivot context (2026-05-19) |
| `PRODUCT_FRAMING.md` | What Brand Blueprint IS |
| `STAGE1_LAUNCH_PLAN.md`, `FIRST_90_DAYS_FINANCIAL_MODEL.md`, `OPERATIONAL_DASHBOARD.md` | Launch + ops |
| `TEAM_TASKS.md`, `TEAM_BUILD_PLAN.md`, `MEETING_PREP_2026-05-21.md` | Coordination |
| `DECISIONS_LOG.md` | Running log of locked decisions |
| `LEGAL_CHECKLIST.md` | Legal TODO |

### Design intelligence (Tab's taste, mirrored to Layer 1)
| File | What | Mirrored as |
|---|---|---|
| `BRAND_VOICE_SPEC.md` | Voice rules + banned/required vocab (drippy, hypnotic, dope ass realness, ...) | `references/iei-voice-rules.md` |
| `VISUAL_REFERENCES.md` | Authoritative taste catalog (26 pieces) | `references/visual-references.md` |
| **`DESIGN_ANATOMY.md`** | **22-design dissection + the 5 flavors. The recipe book.** | `references/design-anatomy.md` |
| `TABS_STORY.md` | Long-form brand story | `references/tabs-story.md` |
| `BRAND_BLUEPRINT_VISUAL_IDENTITY.md` | The visual identity for **IEI's own** Brand Blueprint product (not customer kits) | Not mirrored — would bleed IEI's identity into customers. Reference IP only. |
| `SKILL_UPDATE.md`, `DEV_HANDOFF.md` | Tab's specs for the BE work | Not mirrored (operational) |

### Design skills source IP
Path: `docs/iei-brand-system/design-skills/`.

| File | What |
|---|---|
| `README.md` | What's in here + how it integrates |
| `taste.md` | High-Agency Frontend (the "taste" skill) |
| `emil-design-eng.md` | Emil Kowalski's design-engineering philosophy |
| `frontend-design.md` | Anthropic's frontend-design skill (modified) |
| `taste-stitch.md` | Variant for Google Stitch (less central) |
| `teach-impeccable.md` | Context-gathering setup ritual |

These are the **upstream source** for `references/design-taste.md` (the synthesis) and for `tools/claude-skills/` (the installable team skills).

### Launch assets (mostly mirrored selectively)
Path: `docs/iei-brand-system/launch-assets/`.

| File | Used by |
|---|---|
| `chat-intake-questions.md` | The 26-question script. FE renders question text from this; BE registry mirrors the IDs in `src/lib/intake-questions.ts`. |
| `tab-review-prompt.md` | Tab's review rubric. Mirrored to `references/tab-review-rubric.md` for agent self-review. |
| `customer-revision-flow.md` | Drives BE #26 customer flows |
| `landing-page-copy.md` | Ryan's landing site copy |
| `tab-video-script.md` | Tab's Welcome Moment video |
| `email-templates.md` | Email body drafts (still stubbed in code) |
| `intake-call-script.md` | Premium upgrade flow |
| `PRE_MERGE_CHECKLIST.md` | What to verify before merging content-engine → main |
| `tier-review-checklists.md` | Quality bars per output tier. Mirrored to `references/tier-review-checklists.md`. |
| `legal/{TERMS_OF_SERVICE, PRIVACY_POLICY, IP_CLICKTHROUGH}.md` | Legal drafts |

### Source material
Path: `docs/iei-brand-system/source/`. Raw worksheets (BB Worksheet 1, 6, 8, IEI Facilitator Guide, Participant Workbook). Read-only reference for understanding the IEI methodology origin. Not loaded at runtime.

---

## Layer 3: Team Claude skills — personal `~/.claude/skills/` bundle

Path: `tools/claude-skills/`. See [`tools/claude-skills/README.md`](../tools/claude-skills/README.md) for install + usage.

| Skill | Purpose |
|---|---|
| `frontend-makeover-kit` | Orchestrator — one command, runs the whole makeover workflow |
| `design-taste-frontend` | Anti-slop rules for any frontend work |
| `emil-design-eng` | Kowalski interaction polish |
| `frontend-design` | Distinctive frontend interface guidance |
| `shadergradient` | Animated gradient backgrounds (`@shadergradient/react`) |
| `liquid-logo` | Liquid-metal logos (`@paper-design/shaders-react`) |
| `liquid-glass` | Apple liquid-glass UI (`liquid-glass-react`) |
| `react-three-fiber` | Declarative 3D in React |

Install: `cp -R tools/claude-skills/* ~/.claude/skills/` then restart any Claude Code chat.

---

## Cross-reference: who/what feeds the agent

When a customer hits LOCK IT IN, the brand-playbook agent assembles its context from:

```
  (customer intake answers — chat Q1-Q29)
              │
              ▼
  src/lib/chat-intake.ts ── synthesizeFoundation() (OpenRouter)
              │
              ▼
  IEIBrandFoundation JSON ── stored on the brand row
              │
              ▼
  src/lib/skill.ts ── enqueueBrandBuild() → Phase 1 (playbook) + Phase 2 (variants)
              │                                  │
              ▼                                  ▼
  brand-playbook skill                Variants (callClaude → OpenRouter)
  (SKILL.md + references/             — landing/pitch/dev-brief/social/email
   auto-globbed)                       ▾ landing.ts uses src/lib/variants/vibes.ts
              │                          to pick 3 vibes × 3 pages = 9 outputs.
   loads everything in                   Vibes anchor to Tab's FIVE FLAVORS in
   skills/brand-playbook/references/ —   references/design-anatomy.md. Voice rules,
   the 17+ files mapped in Layer 1.      anti-slop rules, and the tier ship-quality
                                         bar are injected directly into each Phase 2
                                         prompt (the references/ tree only auto-loads
                                         into the Phase 1 skill agent — Phase 2 variants
                                         call callClaude with custom prompts).
```

**To improve agent output**, the cheapest leverage is adding to `docs/iei-brand-system/` (with a `MIRRORS` entry if Tab owns the canonical) — the auto-loader picks it up on next build for Phase 1. For Phase 2 (variants), the references that matter are wired explicitly into the variant prompts; see `src/lib/variants/{vibes,landing,...}.ts`.

### Phase 2 variant files (the runtime that emits each deliverable)

| File | What it generates | Notes |
|---|---|---|
| `src/lib/variants/landing.ts` | The 3 website versions (3 vibes × 3 pages = 9 HTML files) | 2026-05-26 refactor — overrides Tab's 2026-05-21 "one 3-page site" spec; see DECISIONS_LOG.md |
| `src/lib/variants/vibes.ts` | The 5 base vibes + pick-3 logic | Anchored to design-anatomy.md FIVE FLAVORS. New 2026-05-26. |
| `src/lib/variants/pitch.ts` | One-page pitch deck | |
| `src/lib/variants/dev-brief.ts` | Dev brief for the customer's website implementation | |
| `src/lib/variants/social.ts` | Social kit (IG / LinkedIn / TikTok thumbnails) | |
| `src/lib/variants/email.ts` | Email templates | |
| `src/lib/variants/brand-video.ts` | Brand video script | |
| `src/lib/variants/palette-expand.ts` | Extended palette + tints/shades | |
| `src/lib/variants/exemplar.ts` | Loads FamFit + Wone exemplars from `skills/brand-playbook/references/exemplars/` | Only landing + pitch use these |
| `src/lib/variants/shared.ts` | `callClaude` + `brandBrief` + `WONE_STYLE_DIRECTIVES` (the legacy house style still used by pitch / dev-brief / social) | Landing no longer uses WONE — it uses vibes instead |

---

## What still isn't here (known gaps)
- **Ryan's new live UI source** — deployed at `iei-content-engine.vercel.app` but the source isn't on any branch in `Buzzy-Ventures/iei-ventures`. Needs to come from Ryan directly.
- **`main` code-level changes** (async Neon Postgres migration, signature changes to `enqueueBrandBuild`/`retryBrandBuild`) — still NOT merged into `content-engine`. Tracked in `launch-assets/PRE_MERGE_CHECKLIST.md`. Doc content from `main` HAS been pulled in (this consolidation); code merge is a separate focused session.
- **Email provider** — every send is stubbed. Look for `[email-stub]` console logs and `TODO(email)` comments.
- **Stripe refund API** — `decline-refund` flips status but doesn't call `stripe.refunds.create()`.
