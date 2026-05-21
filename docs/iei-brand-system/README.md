# Brand Blueprint — Documentation Index

**Product:** Brand Blueprint
**Parent:** IEI Ventures
**Stage:** Pre-launch, Stage 1 (1:1 sales) imminent
**Target ship:** Friday May 22 (stretch) / Monday May 25 (realistic) — first paying customer

---

## Read this first

If you're new to this project, read in this order:

1. **`PRODUCT_FRAMING.md`** — What Brand Blueprint actually is (the IEI Brand System productized). Source of truth on product identity.
2. **`DECISIONS_LOG.md`** — Every confirmed product decision Tab has made, with dates. Read before assuming anything.
3. **`STAGE1_LAUNCH_PLAN.md`** — The concierge MVP plan for the first 30 days. Cost budget, sequence, risks.
4. **`DEV_HANDOFF.md`** — Where to start if you're the engineer picking this up. Maps every spec to actual code changes.

---

## Documents by purpose

### For Tab (founder operations)

| Doc | When to use |
|---|---|
| `launch-assets/monday-morning-checklist.md` | Day 1 of launch week — hour-by-hour |
| `launch-assets/intake-call-script.md` | Every customer's 60-min Zoom intake call |
| `launch-assets/tier-review-checklists.md` | Tab's QC pass before every delivery |
| `launch-assets/email-templates.md` | All customer-facing emails (welcome → testimonial) |
| `launch-assets/soft-launch-outreach.md` | Cold/warm outreach templates for first 20 prospects |
| `OPERATIONAL_DASHBOARD.md` | Notion setup for tracking customers through pipeline |
| `FIRST_90_DAYS_FINANCIAL_MODEL.md` | Revenue + cost projections + when to raise prices / hire |

### For the dev team (engineering)

| Doc | When to use |
|---|---|
| `DEV_HANDOFF.md` | Start here — full engineering scope |
| `BRAND_VOICE_SPEC.md` | Voice rules for every AI prompt you build |
| `SKILL_UPDATE.md` | Specific edits to `skills/brand-playbook/SKILL.md` |
| `PRODUCT_FRAMING.md` | What we're building, why, and the methodology behind it |

### For the attorney (legal package)

| Doc | When to use |
|---|---|
| `LEGAL_CHECKLIST.md` | Pre-call brief — send this to the attorney |
| `launch-assets/legal/TERMS_OF_SERVICE.md` | Plain-English first draft (saves attorney 30-50% in fees) |
| `launch-assets/legal/PRIVACY_POLICY.md` | Same |
| `launch-assets/legal/IP_CLICKTHROUGH.md` | Mirrors live workshop's Step 2 IP agreement |

### For the landing page builder

| Doc | When to use |
|---|---|
| `launch-assets/landing-page-copy.md` | Full landing page copy, 8 sections, mobile-first |
| `launch-assets/tab-video-script.md` | 90-second hero video + 30-second ad script |

### Reference / IP (server-only — do not expose to clients)

| Doc | Notes |
|---|---|
| `source/TABS COPY_IEI BRAND SYSTEM_Participant Workbook_View Only.txt` | The participant workbook — Tab's proprietary IP |
| `source/IEI_Complete_Facilitator_Guide.txt` | The full facilitator script — Tab's proprietary IP |
| `source/Worksheet 1_Go-to-Market Checklist.txt` | The Fourfold Path master |
| `source/Worksheet 6_Competitor Analysis.txt` | Competitor analysis framework |
| `source/BB Worksheet 8_Product Positioning Worksheet.txt` | Product positioning + Tab's existing VIP Day offers |
| `source/IEI-Ventures-Brand-App-GTM-Plan.txt` | GTM strategy doc for IEI Ventures portfolio |

---

## The 5-minute briefing

If someone has 5 minutes and needs to understand the project:

> **Brand Blueprint** is a digital, AI-assisted version of Tab Wolod's proprietary brand methodology (The IEI Brand System), sold under the **IEI Ventures** parent.
>
> Customers pay **$997 / $1,997 / $3,997** for one of three tiers. Each tier delivers a complete brand foundation (messaging, logo, brand kit, 1-page website, GTM checklist + tier-specific add-ons) within 5 business days.
>
> The MVP launches as a **concierge model**: customers buy via Stripe Payment Link, book a 60-min intake call with Tab via Calendly, Tab runs them through her 6-module IEI Brand System, AI generates first-draft outputs via existing `brand-playbook` skill, **Tab personally reviews every output**, and deliverables ship by email.
>
> **Stage 1 (days 1-30):** 1:1 sales, full concierge, Tab-in-loop fully. Target: 5-15 paying customers.
> **Stage 2 (days 31-60):** Cohort offering, partial automation (chat UI, synthesis bridge).
> **Stage 3 (days 61-90):** Enterprise outreach + first licensing conversations.
>
> **What's working in this MVP that competitors can't replicate:** Tab's proprietary methodology + Tab herself in the loop + GTM-ready output stack (not just a logo).

---

## File map

```
docs/iei-brand-system/
├── README.md                            (this file)
├── PRODUCT_FRAMING.md                   The "what" and "why"
├── DECISIONS_LOG.md                     Every confirmed decision
├── STAGE1_LAUNCH_PLAN.md                30-day plan with budget
├── DEV_HANDOFF.md                       Engineering scope
├── LEGAL_CHECKLIST.md                   Attorney brief
├── BRAND_VOICE_SPEC.md                  AI voice rules
├── SKILL_UPDATE.md                      SKILL.md edits
├── OPERATIONAL_DASHBOARD.md             Notion setup for Tab
├── FIRST_90_DAYS_FINANCIAL_MODEL.md     Revenue projections
├── source/                              Proprietary IP (server-only)
│   ├── TABS COPY_IEI BRAND SYSTEM_Participant Workbook_View Only.txt
│   ├── IEI_Complete_Facilitator_Guide.txt
│   ├── Worksheet 1_Go-to-Market Checklist.txt
│   ├── Worksheet 6_Competitor Analysis.txt
│   ├── BB Worksheet 8_Product Positioning Worksheet.txt
│   └── IEI-Ventures-Brand-App-GTM-Plan.txt
└── launch-assets/
    ├── landing-page-copy.md             Landing page full copy
    ├── tab-video-script.md              Hero video script
    ├── intake-call-script.md            60-min Zoom flow
    ├── tier-review-checklists.md        Per-tier QC
    ├── email-templates.md               Customer emails
    ├── soft-launch-outreach.md          Prospect outreach
    ├── monday-morning-checklist.md      Day 1 hour-by-hour
    └── legal/
        ├── TERMS_OF_SERVICE.md
        ├── PRIVACY_POLICY.md
        └── IP_CLICKTHROUGH.md
```

---

## Status as of 2026-05-18 (end of all-nighter session)

**Locked decisions (per DECISIONS_LOG):**
- Product name: Brand Blueprint
- Parent: IEI Ventures
- Pricing: $997 / $1,997 / $3,997 (Option C)
- Stage 1 motion: 1:1 sales + concierge + Tab-in-loop
- Domain: ieiventures.com/blueprint (Stage 1) → brandblueprint.com (long-term)
- Stripe Payment Links (no SDK integration in Stage 1)
- 5 business days delivery SLA
- Tab bandwidth: 20 hrs/week

**Open decisions waiting on Tab:**
- Live workshop relationship (replace / compete / feed)
- Canva templates (link existing vs generate)
- Exact "brands you admire" intake wording (current draft in intake-call-script.md is approved unless changed)
- Use "TAB SAYS" facilitator scripts verbatim as AI voice OR abstract rules only

**Active tasks:**
- See task list (use `TaskList` tool to view current state)
- 10 tasks created, 2 completed (landing copy, intake script + checklists)
- Tab's next: book attorney, file trademarks, decide landing build path

**Files ready for review:** all docs above. Tab should read in this order tomorrow morning:
1. `launch-assets/monday-morning-checklist.md` (your hour-by-hour)
2. `launch-assets/landing-page-copy.md` (review + approve)
3. `LEGAL_CHECKLIST.md` (skim before attorney calls)
4. `FIRST_90_DAYS_FINANCIAL_MODEL.md` (gut-check the projections)
