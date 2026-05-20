# Team Meeting Prep — 2026-05-21

**From:** Tab
**To:** Buzzy (FE) + Henrique (BE)
**Re:** Brand Blueprint MVP — what's new, what's next, what we lock in the meeting

**Branch with all latest docs:** `docs/brand-system-launch-package`
**Master index:** [docs/iei-brand-system/README.md](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/README.md)

---

## 🆕 What's new since your last update

We had a deep work session yesterday. The MVP got more defined. Key changes:

### 1. We pivoted to a HYBRID model (away from concierge)

Single self-serve tier at **$997** with optional **$1,000 premium upgrade** offered AFTER delivery. Read: [`HYBRID_PIVOT.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/HYBRID_PIVOT.md) (5 min)

### 2. We refined the delivery + refund model (this is the big one)

- AI generates in ~30 min → lands in Tab's review queue
- Tab reviews EVERY customer via structured 15-min form (was 10% spot-check)
- Customer gets WATERMARKED preview — not final files
- Customer hits one of three buttons: **Accept Final Delivery** · **Request Revisions** · **Decline + Refund**
- Acceptance triggers clean unwatermarked file delivery + closes refund window
- 7-day money-back guarantee from preview, no questions asked
- Marketed SLA: "Within 24 hours"

Full: [`DECISIONS_LOG.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/DECISIONS_LOG.md) (scroll to "DELIVERY MODEL REFINEMENT")

### 3. The chat intake questions are FINAL

26 questions across 3 branching paths (existing brand / new side project / starting from scratch), all written in consumer-friendly language with helper text + example answers + skip rules. Plus a Welcome Moment (Tab video + expectations) before Q1.

Read: [`launch-assets/chat-intake-questions.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/launch-assets/chat-intake-questions.md) (15 min — full spec)

### 4. Tab's review dashboard spec is final

Structured checkbox form per section, "Regenerate Flagged Sections" button that builds a clean prompt for AI, "Approve & Send" triggers preview email. Tab targets 15 min per customer.

Read: [`launch-assets/tab-review-prompt.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/launch-assets/tab-review-prompt.md) (10 min)

### 5. Customer revision flow is defined

If customer clicks "Request Revisions" → returns to chat in revision mode → AI asks 1-2 clarifying questions → regenerates → back to Tab's queue.

Read: [`launch-assets/customer-revision-flow.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/launch-assets/customer-revision-flow.md) (10 min)

### 6. Tab's backstory is now a source doc

So the AI's voice + the landing About section + investor bios all pull from one source. Draft ready for Tab review.

[`TABS_STORY.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/TABS_STORY.md) (~15 min to read)

### 7. Legal is in motion

Tab met with attorney 2026-05-20. TOS draft is updated for the new refund/watermark model. Legal package details: [`LEGAL_CHECKLIST.md`](https://github.com/Buzzy-Ventures/iei-ventures/blob/docs/brand-system-launch-package/docs/iei-brand-system/LEGAL_CHECKLIST.md)

---

## 📋 YOUR QUEUE — by role

### 💻 BUZZY (FE)

**🔴 Critical Week 1:**
1. **Task #2 — Build landing site** (simplified to 1 tier at $997)
   - Copy locked in `launch-assets/landing-page-copy.md`
   - Recommend Framer or Webflow for speed (1-2 days)
   - Mobile-first, 1 tier button → Stripe Payment Link (URL coming from Tab)
2. **Task #8 — Chat intake UI** (PROMOTED to Week 1 critical)
   - Full spec in `chat-intake-questions.md`
   - Welcome Moment screen → Q1 → 26 questions branching → Lock It In
   - Pairs with BE Task #19
   - 3-4 dev days
3. **Task #24 — Tab Review Dashboard** (FE side — pairs with BE)
   - Full spec in `tab-review-prompt.md`
   - 2 dev days

**🟡 Days 8-30:**
4. Task #20 — Synthesis review page

### ⚙️ HENRIQUE (BE)

**🔴 Critical Week 1:**
1. **Task #19 — Chat intake API** (PROMOTED to Week 1 critical)
   - Pairs with FE Task #8
   - Full spec + ChatSession schema in `chat-intake-questions.md`
   - 3 dev days
2. **Task #21 — Stripe webhook → auto-provision brand project**
   - 1 dev day
3. **Task #22 — Tab review queue + watermarked preview email**
   - REVISED from auto-delivery to review-queue model
   - 2.5 dev days
4. **Task #26 — Watermark + acceptance infrastructure** (NEW)
   - Watermark all preview files (PDF, SVG, HTML)
   - Accept button → regen clean files + revoke watermarked access
   - 1.5-2 dev days
5. **Task #11 — Apply SKILL.md updates** (waiting on Tab's #17 + #18)
   - 1 dev day after Tab unblocks
6. **Task #12 — Extend types.ts with ieiBrandSystem block**
   - 1 hr

**🟡 Days 8-30:**
7. Task #9 — Synthesis bridge
8. Task #23 — Premium upgrade flow

---

## 🤝 CROSS-TEAM CONTRACTS TO LOCK IN MEETING

Before either of you codes, agree on these data contracts:

| Pair | What to lock |
|---|---|
| **FE #8 + BE #19** | `ChatTurn` shape, sessionId format, error response format, "complete" signal |
| **FE #24 + BE #22** | Review form payload structure, regenerate-flagged-sections endpoint, approve-and-send trigger |
| **FE #24 + BE #26** | How preview vs. final files are served (auth-gated routes), watermark removal trigger |
| **BE #21 (no FE)** | Stripe webhook payload → BrandProject schema |
| **FE #20 + BE #9** (Days 8-30) | `IEIBrandFoundation` JSON shape |

---

## 🎯 MEETING AGENDA (suggested — 60 min)

| Time | Topic | Lead |
|---|---|---|
| 0:00-0:10 | Tab walks through hybrid pivot + new delivery model | Tab |
| 0:10-0:20 | Buzzy: landing site approach (Framer? custom?) + chat UI plan | Buzzy |
| 0:20-0:30 | Henrique: chat API + Stripe webhook + watermark approach | Henrique |
| 0:30-0:45 | Lock the cross-team contracts (table above) | All |
| 0:45-0:55 | Open questions (list below) — decide each | All |
| 0:55-1:00 | Each commits ONE thing they ship by end of week | All |

---

## ❓ OPEN QUESTIONS TO DECIDE IN MEETING

These need a call before coding starts:

1. **Landing site path** — Framer/Webflow (Tab can edit later, 1-2 days) OR custom Next.js in repo (3-4 days, dev maintained)?
2. **Email provider** — Resend? Postmark? Loops? (Affects #22 build path.)
3. **Watermark approach** — Library choice for PDF (`pdf-lib` is already installed) + raster watermark (sharp? canvas?)
4. **Customer-edit summary during intake** — Tab flagged this maybe-feature: should customer see AI's interpretation of their answers during chat and be able to correct live before generation? (Adds ~1 dev day to FE/BE chat work, but builds trust.)
5. **Skip behavior on the 3 required questions** (Q1 gateway, Q3 brand name, Q22 ideal customer, Q24 offering) — confirm we hard-block skip OR allow with consequences?
6. **Resume token + magic-link** — how long does an abandoned chat session stay resumable? (Doc says 30 min triggers email, but session stays alive how long? 7 days? 30?)

---

## 🚦 WHAT'S BLOCKING WHOM

```
Tab #17 (vocabulary) ──┐
                       ├──→ BE #11 (SKILL.md updates)
Tab #18 (visual refs)──┘

Tab #3 (Stripe Payment Links) ──→ FE #2 (landing site CTA) → end-to-end test #7

Tab #25 (chat intake questions) ──✓ DONE → FE #8 + BE #19 can start

FE #2 (landing) + BE #19 + BE #21 + BE #22 ──→ Tab #7 (end-to-end test)
                                                  ↓
                                              First paying customer
```

---

## 📅 REALISTIC LAUNCH TARGET

- **Now → Day 7 (this week):** All Week 1 critical tasks ship
- **Day 8-10:** End-to-end test with friendly customer
- **Day 10-14:** Soft launch to 20-prospect warm network
- **First paying customer:** ~10-14 days from today

---

## 📚 IF YOU ONLY READ THREE THINGS

1. `HYBRID_PIVOT.md` (5 min) — strategic context
2. `chat-intake-questions.md` (15 min) — the actual chat product spec
3. `TEAM_TASKS.md` (10 min) — full task split with dependencies

Everything else is reference — read as needed.

---

**Questions before the meeting?** DM Tab anytime.

**See you tomorrow.** Let's build.
