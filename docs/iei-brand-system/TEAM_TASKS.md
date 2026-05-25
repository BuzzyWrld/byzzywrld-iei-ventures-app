# Team Task Assignments — v2 (Hybrid Self-Serve)

**Updated:** 2026-05-19 (post hybrid pivot)
**Supersedes:** v1 (concierge model). See `HYBRID_PIVOT.md` for the why.

---

## THE PRODUCT IN ONE PARAGRAPH

Brand Blueprint is a **self-serve AI brand-building product at $997**. Customer pays via Stripe → lands in a chat interface that interviews them through Tab's 6-module IEI Brand System → AI generates their complete brand foundation (messaging, 3 logos, brand kit, 3-page website (Home + About + flex), GTM checklist) → auto-delivered by email within 5 business days. Optional premium upgrade after delivery: **+$1,000 for a 60-min Brand-Storming call with Tab and personal refinement**. The chat IS the interface. No Zoom call required for the standard product. Tab spot-checks 10% of deliveries to monitor quality.

---

## OWNERSHIP AT A GLANCE

- 👤 **Tab** — founder ops, sales, brand IP, creative direction, premium-tier delivery
- 💻 **FE Dev** — frontend (landing page, chat UI, review page, admin dashboard)
- ⚙️ **BE Dev** — backend (APIs, LLM integration, Stripe webhook, auto-delivery, types, skill prompt)

---

## 👤 TAB'S QUEUE — 12 tasks

### 🔴 URGENT this week (Week 1)

| # | Task | Effort | Why urgent |
|---|---|---|---|
| #4 | Book attorney + send pre-call brief | 90 min | **MEETING TONIGHT** — launch blocker |
| #5 | File trademarks (Brand Blueprint + IEI Ventures) | 2 hrs | 6-12 month examination clock — file ASAP |
| #25 | **Rewrite intake questions for CHAT delivery** | 2 hrs | **BLOCKS chat UI build** — devs need this |
| #17 | **Curate brand vocabulary** (URGENT now) | 1 hr | **BLOCKS SKILL.md update** — only way you shape output now |
| #18 | **Compile visual references** (URGENT now) | 2 hrs | **BLOCKS SKILL.md update** — only way you guide visuals |
| #3 | Stripe Payment Links (1 for $997, 1 for $1,000 upgrade) | 30 min | Needed before any sale |
| #15 | Register brandblueprint.com (or similar) | 10 min | Long-term product domain |
| #16 | Record 90-sec hero video | 60 min | Single highest-trust asset on landing |

### 🟡 Week 2

| # | Task | Effort |
|---|---|---|
| #13 | Notion operational dashboard | 45 min |
| #14 | Build 20-prospect outreach list | 1 hr |
| #7 | End-to-end test of self-serve flow (with friendly customer) | 4 hrs |

### 🟢 Ongoing (Week 3+)

| # | Task | Effort |
|---|---|---|
| #10 | Capture 2 customer video testimonials | Per customer |
| **NEW ongoing** | Spot-check 10% of deliveries for quality | ~1-2 hrs/week |
| **NEW ongoing** | Deliver premium upgrades (when customers opt in) | ~2.5 hrs per upgrade |

**Total Tab time Week 1:** ~10 hrs (well under 20 hr/week budget — leaves room for sales)

---

## 💻 FRONTEND DEV'S QUEUE — 4 tasks

### 🔴 URGENT Week 1

| # | Task | Effort | Notes |
|---|---|---|---|
| #2 | Build landing site (simplified to 1 tier $997) | 1-2 days | Framer recommended. Copy in `launch-assets/landing-page-copy.md` — just simplify Section 4 (pricing) to 1 card. |
| #8 | **Chat intake UI** (PROMOTED from Days 8-30 — now MVP-critical) | 3-4 days | Pairs with BE #19. Coordinate API contract upfront. Wait for Tab's #25 (intake questions) before wiring the actual prompts. |

### 🟡 Week 2

| # | Task | Effort |
|---|---|---|
| #24 | Spot-check admin dashboard (Tab reviews 10% of deliveries) | 1 day |

### 🟢 Days 8-30 (after MVP ships)

| # | Task | Effort |
|---|---|---|
| #20 | Synthesis review/edit page (v2 quality feature) | 2 days |

**FE Week 1 critical path:** #2 landing → #8 chat UI. Realistically 4-6 days of focused work.

---

## ⚙️ BACKEND DEV'S QUEUE — 7 tasks

### 🔴 URGENT Week 1 (ALL MVP-blocking — the automation backbone)

| # | Task | Effort | Pairs with / Notes |
|---|---|---|---|
| #19 | **Chat intake API** | 3 days | Pairs with FE #8. Wait for Tab's #25 before wiring prompts. |
| #21 | **Stripe webhook → auto-provision brand project** | 1 day | NEW task. Replaces Tab manually creating projects. |
| #22 | **Auto-delivery system** (ZIP + email) | 1.5 days | NEW task. Replaces Tab manually emailing. |
| #11 | **Apply SKILL_UPDATE.md** (now urgent — no Tab safety net) | 1 day | Wait for Tab's #17 + #18 first. |
| #12 | Extend types.ts with `ieiBrandSystem` block | 1 hr | Supports #11. |

### 🟡 Week 2

| # | Task | Effort |
|---|---|---|
| #23 | Premium upgrade flow (+$1,000 Brand-Storming) | 0.5 day |

### 🟢 Days 8-30 (post-MVP quality leap)

| # | Task | Effort |
|---|---|---|
| #9 | Synthesis bridge (Sonnet) — quality multiplier for generation | 2 days |

**BE Week 1 critical path:** #19 chat API + #21 webhook + #22 auto-delivery + #11 SKILL.md (after Tab unblocks). Realistically 6-7 days of focused work.

---

## 🤝 CROSS-TEAM COORDINATION

Three pairs MUST sync on contracts BEFORE coding:

| FE task | BE task | They agree on |
|---|---|---|
| #8 chat UI | #19 chat API | `ChatTurn` shape, sessionId format, error format, "complete" signal |
| (no FE) | #21 Stripe webhook | What payload BE expects from Stripe → brand-project schema |
| (no FE) | #22 auto-delivery | Email provider choice (Resend/Postmark/Loops), ZIP structure, download URL format |
| #20 review page (Wk 3) | #9 synthesis API (Wk 3) | `IEIBrandFoundation` JSON shape |

**Recommended:** 30-min sync meeting Day 1 of Week 1 to lock contracts before either side codes.

---

## THE CORRECTED LOGICAL SEQUENCE

The task system shows some legacy dependencies — here's the ACTUAL build order:

### Week 1 (Days 1-7) — Foundation in parallel

```
Tab:  Attorney + Trademarks (Day 1)
      Chat intake questions (#25, ~Day 2)
      Vocabulary + Visual refs (#17, #18, by Day 4)
      Domain + Video (#15, #16, by Day 5)

FE:   Landing site (#2, Days 1-3)
      Start chat UI (#8, Days 4-7) — wires Tab's #25 questions

BE:   Chat API (#19, Days 1-5)
      Stripe webhook (#21, Days 5-6)
      Auto-delivery (#22, Days 6-7)
      SKILL.md updates (#11, Day 7 — once Tab's #17 + #18 land)
      types.ts (#12, 1 hr — opportunistic)
```

### Week 2 (Days 8-14) — Integration + test

```
Tab:  Stripe Payment Links (#3)
      Notion dashboard (#13)
      20-prospect outreach list (#14)
      End-to-end test with friendly customer (#7) — Day 10-12

FE:   Finish chat UI · spot-check dashboard (#24)
BE:   Premium upgrade flow (#23) · bug fixes from #7 testing
```

### Week 3 (Days 15-21) — Soft launch

```
Tab:  Send 20-prospect outreach → first paying customers
      Spot-check first deliveries

FE/BE: Stabilize, monitor, fix bugs as real customers hit edge cases
```

### Days 22-30 — Real customers + iteration

```
Tab:  Capture testimonials · paid ads experiment · Stage 2 prep
Dev:  Synthesis bridge (#9) · review page (#20) · cleanup
```

---

## 🚨 PRIORITY ESCALATION

If any task is at risk of slipping more than 2 days:

| Task type | Action |
|---|---|
| Tab tasks (legal, trademarks) | Tell the team — these are launch blockers, real cost to slipping |
| Tab tasks (vocab, visuals, chat questions) | These block dev work — devs sit idle. Tell team immediately. |
| FE landing site | If past Day 5, fall back to Carrd.co single-page (2-hour setup, $19/yr) as temporary |
| FE/BE chat | Cannot ship MVP without it. Escalate immediately. Consider scope cut (skip "skip" button, skip follow-ups, just linear 6-question flow). |
| BE webhook + auto-delivery | Without these, Tab manually orchestrates. Still ship-able as concierge fallback for first 5 customers. |
| BE SKILL.md updates | Without these, generation quality is "good but generic." Ship MVP anyway; quality improves when these land. |

**One rule for everyone:** if you're making a product decision the docs don't cover — STOP and ask Tab. Empty space in docs = decision not made yet, NOT "use your judgment."

---

## ⚙️ TECH STACK NOTES (for reference)

**Existing infrastructure that doesn't change:**
- Next.js (non-standard version — see `AGENTS.md` at repo root before any code)
- Anthropic Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) — already wired in `src/lib/skills/agent-sdk.ts`
- Blob storage for brand projects (`src/lib/blob-brands.ts`)
- Playwright for HTML → PDF (`src/lib/pdf.ts`)
- Existing `brand-playbook` skill at `skills/brand-playbook/` — gets EDITS not rewrites

**New dependencies needed:**
- Stripe SDK (for webhook signature verification) — `npm install stripe`
- Email provider — pick ONE: Resend (recommended for DX), Postmark, or Loops
- Archiver (for ZIP packaging) — `npm install archiver`

**Models per call:**
- Chat agent (each turn): Claude Haiku
- Brand-playbook generation: Claude Sonnet (or Haiku for cost mode)
- Synthesis bridge (Days 8-30): Claude Sonnet
- Total avg cost per brand: ~$1.50-$2.50

---

## SUGGESTED KICKOFF CALL AGENDA (60 min)

| Time | Topic | Lead |
|---|---|---|
| 0:00-0:10 | Product overview — read this doc together | Tab |
| 0:10-0:15 | Read `HYBRID_PIVOT.md` for context | All |
| 0:15-0:25 | FE: walk through landing simplification + chat UI plan | FE |
| 0:25-0:35 | BE: walk through chat API + webhook + auto-delivery | BE |
| 0:35-0:45 | Lock cross-team contracts (3 pairs above) | All |
| 0:45-0:55 | Risks + open questions | All |
| 0:55-0:60 | Each person commits ONE thing they ship by end of Week 1 | All |

---

## REFERENCE DOCS

| If you need to understand... | Read |
|---|---|
| What we're building and why | `PRODUCT_FRAMING.md` |
| Why we pivoted to hybrid | `HYBRID_PIVOT.md` |
| All confirmed decisions | `DECISIONS_LOG.md` |
| The 6 IEI Brand System modules | `PRODUCT_FRAMING.md` + `source/IEI_Complete_Facilitator_Guide.txt` |
| AI voice rules for any output | `BRAND_VOICE_SPEC.md` |
| Specific code changes for SKILL.md | `SKILL_UPDATE.md` |
| Landing page copy | `launch-assets/landing-page-copy.md` |
| Email templates | `launch-assets/email-templates.md` |
| Customer journey | `STAGE1_LAUNCH_PLAN.md` (concierge sections superseded by hybrid) |
| Revenue projections | `FIRST_90_DAYS_FINANCIAL_MODEL.md` (revising soon for hybrid) |
| Engineering deep dive | `DEV_HANDOFF.md` |
| Notion setup for Tab | `OPERATIONAL_DASHBOARD.md` |
| Legal package | `LEGAL_CHECKLIST.md` + `launch-assets/legal/*.md` |

---

**Last updated:** 2026-05-19
