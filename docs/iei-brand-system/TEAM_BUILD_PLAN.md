# Brand Blueprint — Team Build Plan

**For:** IEI Ventures dev team + collaborators
**From:** Tab Wolod
**Status:** Pre-launch — Stage 1 ship target: Friday May 22 (stretch) / Monday May 25 (realistic)

This document is the single executive briefing for the team. Full reference docs live in `docs/iei-brand-system/` — pointers throughout.

---

## What we're building

**Brand Blueprint** — a digital, AI-assisted version of Tab Wolod's proprietary "IEI Brand System." Founders pay $997-$3,997 to receive a complete brand foundation (messaging, logo, brand kit, 1-page website, GTM checklist + tier-specific add-ons) within 5 business days, AI-built and **personally reviewed by Tab.**

Parent brand: **IEI Ventures.** Product brand: **Brand Blueprint.** Live workshop ($250 "Idea to Income Diagnostic") continues — Brand Blueprint is the productized step up.

**The 3 differentiators competitors can't replicate:**
1. Proprietary methodology — The IEI Brand System (Tab's IP, 6 modules)
2. Tab personally reviews every output before delivery
3. Complete GTM-ready stack — not just a logo

---

## The product spine — Tab's 6 modules

Every customer goes through these in order during the 60-min intake call:

| # | Module | What it produces |
|---|---|---|
| 1 | **One Brilliant Idea** | Locked one-sentence anchor (Love + Good At = Idea) |
| 2 | **Who Are You?** (ABCs of Branding) | Identity · Story · Mission · Voice · Secret Sauce + tagline options |
| 3 | **Who Are They?** | Ideal client (Demographics · Psychographics · Dream 100 Lite) |
| 4 | **What Do They Need?** | The 6-Part Offering Framework + value-based pricing |
| 5 | **The Narrative** | 7-part story + hook line |
| 6 | **Content & Comms** | 5-Post Framework (Awareness 50% · Trust 30% · Convert 20%) |

Locks into **The Fourfold Path to Meaningful Marketing** (Ideation · Impact · Implementation · Income) for the 6-week GTM roadmap.

---

## Pricing (locked — Option C)

| Tier | Price | Includes | Tab review |
|---|---|---|---|
| **Blueprint Basic** | **$997** | Brand messaging · 3 logo options · brand kit · 1-page website · GTM checklist | 90 min |
| **Blueprint + Content** | **$1,997** | Basic + content (first 5 posts, master AI prompt, Canva templates) + more brand assets | 3 hrs |
| **Full Suite** | **$3,997** | + Content + ideal client profile + 6-part offering doc + 7-part narrative + 6-week roadmap + 90-day content calendar | 5 hrs |

**Capacity at 20 hrs/wk Tab time:** ~6-8 customers/week. Revenue ceiling Stage 1 ≈ $80K/month.

---

## Domain + URL

- Parent: `ieiventures.com`
- Product (Stage 1): `ieiventures.com/blueprint`
- Long-term: register `brandblueprint.com` in parallel, redirect later (Task #15)

---

## Stage 1 customer journey (concierge — no chat UI yet)

```
1. Landing page (ieiventures.com/blueprint)
   → Hero video + 3 tier cards + Stripe Payment Link buttons

2. Stripe checkout
   → IP/Confidentiality clickthrough at checkout
   → Post-payment redirect to Calendly (60-min intake)

3. 60-min Zoom intake call with Tab
   → Tab runs IEI Brand System 6 modules
   → Records call, types intake into existing /new/deep form, triggers AI generation

4. AI generation (existing brand-playbook skill)
   → 10-20 min generation time
   → Outputs: brand.json, playbook.html/pdf, landing.html, logo.svg, plus tier-specific add-ons

5. Tab review (per tier-review-checklists)
   → 90 min - 5 hr depending on tier
   → Regenerates weak sections if needed

6. Delivery email (5 business days post-intake)
   → ZIP with all deliverables + Canva links + personal note
   → Exit survey + testimonial opt-in

7. Optional refinement pass (one round included)
```

---

## The 30-day build sequence

### Days 1-7 (THIS WEEK) — Stage 1 launch

| # | Task | Owner | Effort | Status |
|---|---|---|---|---|
| 1 | Write landing page copy | Tab + Claude | 4 hrs | ✅ COMPLETED — `launch-assets/landing-page-copy.md` |
| 2 | Build 1-page landing site (Framer recommended) | Dev OR Tab no-code | 1-2 days | ⏳ Pending |
| 3 | Set up 3 Stripe Payment Links | Tab | 30 min | ⏳ Pending |
| 4 | Book attorney + send legal package | Tab | 90 min call | ⏳ MEETING TONIGHT |
| 5 | File trademarks (Brand Blueprint + IEI Ventures) | Tab | 2 hrs | ⏳ Pending |
| 6 | Intake script + tier review checklists | Tab + Claude | 4 hrs | ✅ COMPLETED — `launch-assets/intake-call-script.md` + `tier-review-checklists.md` |
| 7 | End-to-end test with 1 friendly customer | Tab | 4 hrs | ⏳ Blocked by #2, #3 |
| 13 | Notion dashboard setup | Tab | 45 min | ⏳ Pending — `OPERATIONAL_DASHBOARD.md` |
| 14 | Build 20-prospect outreach list | Tab | 1 hr | ⏳ Blocked by #2 (sending) |
| 15 | Register brandblueprint.com | Tab | 10 min | ⏳ Pending |
| 16 | Record Tab's 90-sec hero video | Tab | 60 min | ⏳ Pending — script in `launch-assets/tab-video-script.md` |

### Days 8-30 — Cohort prep + automation

| # | Task | Owner | Effort | Why now |
|---|---|---|---|---|
| 8 | Conversational chat intake | Dev | 3-4 days | Frees Tab from doing every intake call |
| 9 | Synthesis bridge (Sonnet-powered IEI Brand System synthesis) | Dev | 2 days | Quality multiplier |
| 11 | Apply SKILL_UPDATE.md edits to brand-playbook skill | Dev | 1 day | IEI Brand System awareness in generation |
| 12 | Extend types.ts with ieiBrandSystem block | Dev | 1 hr | Required for #11 |
| 10 | Capture 2 customer video testimonials | Tab | Ongoing | Stage 2 cohort sales prereq |

---

## Engineering specifics (for devs)

### 🚨 Read these before writing any code

1. **`AGENTS.md` at repo root** — "This is NOT the Next.js you know." Always check `node_modules/next/dist/docs/` before assuming Next.js patterns.
2. **`docs/iei-brand-system/DEV_HANDOFF.md`** — full engineering scope mapped to existing codebase.
3. **`docs/iei-brand-system/BRAND_VOICE_SPEC.md`** — voice rules for any AI prompt you write. Banned vocabulary is real — outputs with "leverage," "transformative," "comprehensive" etc. are broken.
4. **`docs/iei-brand-system/SKILL_UPDATE.md`** — specific surgical edits to `skills/brand-playbook/SKILL.md`.

### What's already built (KEEP, don't rebuild)

- `src/lib/skills/agent-sdk.ts` — Anthropic Agent SDK adapter (works)
- `src/lib/skills/contract.ts` — Skill interface
- `src/lib/variants/` — Logo/landing/palette variant generation (works)
- `src/lib/blob-brands.ts` — Brand persistence
- `src/lib/types.ts` — Brand types (EXTEND with ieiBrandSystem, don't replace)
- `src/app/new/deep` — Deep intake form (Tab uses this as concierge intake input until Task #8 ships)
- `src/app/api/brands/` — Brand CRUD
- `skills/brand-playbook/SKILL.md` — Generation prompt (UPDATE per `SKILL_UPDATE.md`)

### What's NEW

- `ieiventures.com/blueprint` landing page (Framer/Webflow recommended for speed)
- 3 Stripe Payment Links (no SDK in Stage 1 — just Dashboard links)
- Calendly intake-call scheduling
- Email templates loaded into email tool
- (Days 8-30): Chat intake UI + synthesis bridge + Stripe webhook auto-provisioning

### Cost budget per Brand Blueprint sold

- Anthropic API: $1-$3 per brand (enable prompt caching on SKILL.md)
- Stripe fees: 2.9% + $0.30 per transaction
- Email: ~$0 at Stage 1 volume

---

## Critical voice rules (everyone making customer-facing copy)

**USE VERBATIM (Tab's proprietary phrases):**
- "Ideas Equal Income" · "From Idea to Income" · "Long live the light bulb moments"
- "Lock It In" · "Push past the first obvious answer" · "The answer is already inside you"
- "Long math first — raw truth before polish"
- "Your brand is like a baby"
- "The IEI Brand System" · "The Fourfold Path to Meaningful Marketing"

**NEVER USE (AI tells — breaks the brand):**
- comprehensive · robust · leverage · delve · transformative · holistic · seamless · ecosystem · synergy · paradigm
- "in today's fast-paced world" · "at the intersection of" · "where X meets Y" · "navigate the complexities"
- ANY emoji in customer-facing output

Full list: `BRAND_VOICE_SPEC.md`.

---

## Legal foundation (BLOCKS LAUNCH — non-negotiable)

Meeting with attorney TONIGHT. Attorney is producing (with Claude's plain-English drafts as starting points):
1. Terms of Service
2. Privacy Policy
3. IP / Confidentiality clickthrough (at Stripe checkout)
4. Trademark filing strategy
5. Entity structure advice (IEI Ventures as parent — single LLC vs. holding + subs)

**Cannot take Stripe payments without 1-3 in place.** Target turnaround from attorney: 5-7 business days.

Plain-English drafts at `launch-assets/legal/`. Costs ~$1,500-$3,500 total.

---

## What success looks like

### Week 1
- Attorney engaged, legal drafts in turnaround
- Trademarks filed
- Landing page live
- Stripe Payment Links live
- 1 friendly customer through the full flow
- Soft launch outreach to 20 warm prospects sent

### Week 2-4
- 5-10 paying customers
- First 2 strong testimonials captured
- Notion dashboard tracking everything
- First refinement-pass cycle completed

### Days 31-60
- Chat intake UI live (frees Tab from every intake call)
- Synthesis bridge live (quality leap)
- First cohort offer packaged + first cohort sold

### Days 61-90
- Enterprise + licensing conversations begun
- Revenue ≈ $20-25K/month
- Decision on bankroll path (revenue-funded path likely sufficient — see `FIRST_90_DAYS_FINANCIAL_MODEL.md`)

---

## Open questions (Tab to confirm)

These don't block launch but should be resolved by week 2:

1. **Live workshop relationship** — does Brand Blueprint feed the live workshop, replace it, or compete with it?
2. **Canva templates** — link Tab's existing templates, or generate via AI?
3. **"TAB SAYS" facilitator scripts** — use verbatim in AI voice, or abstract rules only?
4. **Backup product names** — in case "Brand Blueprint" trademark is opposed (prepare 2-3 alternatives)

---

## Reference index — what's in `docs/iei-brand-system/`

If you want to go deeper on any topic, the source docs are organized:

| Need | Read |
|---|---|
| What this product is | `PRODUCT_FRAMING.md` |
| Every decision Tab has made | `DECISIONS_LOG.md` |
| 30-day plan + costs | `STAGE1_LAUNCH_PLAN.md` |
| Engineering scope | `DEV_HANDOFF.md` |
| AI voice rules | `BRAND_VOICE_SPEC.md` |
| SKILL.md changes | `SKILL_UPDATE.md` |
| Revenue projection | `FIRST_90_DAYS_FINANCIAL_MODEL.md` |
| Customer tracking | `OPERATIONAL_DASHBOARD.md` |
| Landing copy | `launch-assets/landing-page-copy.md` |
| Tab's intake script | `launch-assets/intake-call-script.md` |
| Review checklists | `launch-assets/tier-review-checklists.md` |
| Customer emails | `launch-assets/email-templates.md` |
| Outreach DMs | `launch-assets/soft-launch-outreach.md` |
| Tab's Day-1 plan | `launch-assets/monday-morning-checklist.md` |
| Legal drafts | `launch-assets/legal/` |

---

## How to contact / sync

- **Tab Wolod** — twolod@ieiagency.com
- Slack: [TBD if team uses Slack]
- Project repo: `C:\Users\wolod\iei-ventures\` (Tab's local — will need to push to GitHub for team access)

---

**Last updated:** 2026-05-19
