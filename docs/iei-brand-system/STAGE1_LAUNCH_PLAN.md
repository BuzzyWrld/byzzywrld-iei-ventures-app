# Brand Blueprint — Stage 1 Launch Plan (Concierge MVP)

**Product name:** Brand Blueprint (under IEI Ventures parent)
**Stage 1 motion:** One-to-one sales, concierge delivery, Tab-in-loop fully
**Target ship:** Friday May 22 (stretch) or Monday May 25 (realistic) — first paying customer onboarded
**Tab's bandwidth:** 20 hrs/week sales + review
**Implied capacity at full utilization:** 6-8 customers/week, avg tier $1,500 = $9k-$12k/week gross

---

## The offer (locked 2026-05-18)

| Tier | Price | What the customer gets | Tab review time est. |
|---|---|---|---|
| **Blueprint Basic** | **$750** | Brand messaging (mission · vision · values · voice · 3 tagline options · IG bio) · 3 logo options · brand kit (color palette + typography + logo system) · 3-page website (Home + About + flex) · GTM checklist customized to their stated goals | ~2 hrs |
| **Blueprint + Content** | **$1,500** | Everything in Basic + double the brand assets + content (first 5 social posts per the 5-Post Framework, master AI prompt for ongoing content, Canva templates copy-paste ready) | ~3.5 hrs |
| **Full Suite** | **$3,000** | Everything in + Content + ideal client profile (WS7) + 6-part offering doc (WS8) + 7-part brand narrative + 6-week Fourfold Path GTM roadmap + 90-day content calendar | ~5 hrs |

**Each tier prepares the customer to go to market — or be reintroduced — with a complete brand foundation rooted in Tab's IEI Brand System.**

---

## The Stage 1 customer journey (concierge — no chat UI required)

```
1. Customer lands on brand-blueprint.com (or chosen domain)
   └─ Sees 90-second Tab video + 3 tiers + Stripe Payment Link

2. Customer clicks tier → Stripe checkout
   └─ Pays · accepts IP/Confidentiality clickthrough · books 60-min intake call via Calendly

3. Tab runs 60-min Zoom intake call (uses IEI Brand System modules as the script)
   └─ Records call · types intake into existing /new/deep form · triggers generation

4. AI generates outputs via existing brand-playbook skill (10-20 min)
   └─ Tab reviews all outputs · QC's logo · refines brand messaging · checks GTM checklist

5. Tab packages deliverables · sends delivery email (1-2 days post-intake)
   └─ Customer receives ZIP + Notion page + Canva links + thank-you video

6. Customer fills 5-question exit survey (embedded in delivery email)
   └─ Opt-in for testimonial · referral incentive ($100 off their next purchase)
```

**This flow uses ZERO new engineering for steps 1-6 except: landing page + Stripe + Calendly + email templates.**

---

## The day-1 to day-30 build sequence

### Days 1-7 (THIS WEEK — Stage 1 launch)

| # | Task | Owner | Effort |
|---|---|---|---|
| 1 | Lock landing page copy (hero + 3 tiers + Tab video script + IP clickthrough text) | Tab + Claude | 4 hrs |
| 2 | Build 1-page landing site (Framer or Webflow recommended — fast + design-flexible) | Dev or Tab | 1-2 days |
| 3 | Set up 3 Stripe Payment Links ($750 / $1,500 / $3,000) with metadata for tier tracking | Tab | 30 min |
| 4 | Calendly with 60-min intake call template, tier-aware (different intake scripts per tier) | Tab | 1 hr |
| 5 | Email templates: welcome (post-purchase), intake-confirmation, delivery, exit-survey | Tab + Claude | 2 hrs |
| 6 | File trademarks: "Brand Blueprint" + "IEI Ventures" via USPTO TEAS Plus | Tab (DIY) or paralegal | 2 hrs / ~$700 |
| 7 | Attorney call — legal deliverables (see `LEGAL_CHECKLIST.md`) | Tab + attorney | 90 min / $1,500-$3,500 |
| 8 | Concierge ops doc: Tab's intake script + tier-specific review checklists + delivery SLA | Tab + Claude | 4 hrs |
| 9 | Test the full flow end-to-end with ONE friendly customer (free or discounted) | Tab | 4 hrs |
| 10 | Soft launch — DM/email 20 warm prospects with the landing page | Tab | ongoing |

**Days 1-7 total Tab time: ~20 hrs (matches stated bandwidth). Engineering time: ~12 hrs.**

### Days 8-30 (Cohort prep + automation start)

| # | Task | Owner | Why now |
|---|---|---|---|
| 11 | Replace Zoom intake with conversational chat UI (per `CHAT_STATE.md`) | Dev | Frees Tab from doing every intake; scales toward cohorts |
| 12 | Build synthesis bridge (per `SYNTHESIS_PROMPT.md`) | Dev | Quality multiplier — gives AI Tab's reasoning move |
| 13 | Stripe webhook → automatic project provisioning | Dev | Removes Tab's manual ops between checkout and intake |
| 14 | Customer dashboard (view deliverables, request tweaks, leave feedback) | Dev | Reduces support email volume; preps for cohort group dynamic |
| 15 | Cohort offer package: 5-customer batch at $X price with weekly group call from Tab | Tab | Stage 2 motion (cohort sales begin day 31) |
| 16 | Reference-customer outreach: get 2 Stage 1 customers to record video testimonials | Tab | Needed for cohort + enterprise pitches |
| 17 | Decide bankroll path based on Stage 1 revenue (revenue-funded / customer-funded / raise) | Tab + Ashley | Per GTM doc days 61-90 prep |

---

## Cost budget (days 1-30)

| Line item | Cost | Notes |
|---|---|---|
| Trademark filing × 2 (Brand Blueprint + IEI Ventures) | ~$700 | USPTO TEAS Plus is $250/class + paralegal optional |
| Attorney legal package | $1,500-$3,500 | One-time; covers TOS, Privacy, IP clickthrough, entity structure advice |
| Landing site hosting (Framer Pro or Webflow CMS) | $25-$40/mo | If using no-code; $0 if dev builds custom |
| Stripe transaction fees | 2.9% + $0.30/txn | $750 sale = $22 fees; $1,500 = $44; $3,000 = $87 |
| Calendly Pro (for tier-aware scheduling) | $12/mo | |
| Anthropic API (Claude generation) | $0.30-$1.50/brand | Sonnet for synthesis ($0.05) + Haiku for bulk ($0.25-$1.00) |
| Email sender (Resend / Postmark / Loops) | $0-$25/mo | Free tier covers Stage 1 volume |
| Domain registration | $12-$30/yr | |
| **Total upfront (days 1-30):** | **~$2,300 - $4,300** | Mostly one-time legal + trademark |
| **Monthly recurring:** | **~$50 - $100/mo** | Hosting + Calendly + email |
| **Variable per customer:** | **~$25 - $90** | Stripe fees + Anthropic API |

**Break-even at first $750 sale.** Gross margin on first 10 customers ≈ 90%+ (after fixed costs amortized).

---

## What's revolutionary about this (the pitch)

The differentiation isn't "AI brand kit." Every AI brand tool does that and they're $50-$500.

**The differentiation is:** Tab Wolod's proven IEI Brand System + AI acceleration + Tab herself reviews every delivery + you walk away with a complete brand-to-revenue foundation, not just a logo.

Three things competitors can't replicate:
1. **The methodology is proprietary** — IEI Brand System exists nowhere else
2. **Tab is in the loop** — no other AI brand tool has a senior strategist reviewing every output
3. **The output is GTM-ready** — most AI brand tools stop at logo; this includes content, messaging, website, GTM checklist

Pitch one-liner: *"The brand foundation a senior strategist would build, delivered in 5 days, reviewed by the strategist herself. From idea to income — starting with the brand."*

---

## Risks specifically tied to Stage 1

| # | Risk | Mitigation |
|---|---|---|
| 1 | Tab burnout at 20 hrs/wk + intake calls + review + sales + ops | Cap Stage 1 at 6 customers/week; close intake calendar when full |
| 2 | First customer's output isn't Tab quality → bad testimonial → adoption stall | First 3 customers are friends/extended network at deep discount or free; learn before charging full price |
| 3 | Trademark gets opposed or rejected | File now; have backup names ready (Brand Box, Brand-in-a-Box, Blueprint Pro, etc.) |
| 4 | Customer expects more than the tier delivers | Tier deliverable boundaries are CRYSTAL CLEAR on landing page + delivery email; over-delivering on tier 1 trains bad expectations |
| 5 | Stripe disputes / chargebacks | Clear refund policy in TOS (24-hour money-back window before intake call begins); after intake, no refund |
| 6 | IP leak via prompt injection from a hostile customer | Server-only system prompts; never include facilitator guide text in user-visible prompts |
| 7 | First customer takes 7 days instead of 2; word of mouth says "slow" | Set delivery SLA at 5 business days post-intake; under-promise over-deliver |
