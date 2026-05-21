# Hybrid Pivot — Self-Serve First, Premium as Upsell

**Date:** 2026-05-19 (late session)
**Decision:** Tab confirmed.
**Supersedes:** parts of STAGE1_LAUNCH_PLAN.md (concierge-only model) and the 3-tier pricing in DECISIONS_LOG.md.
**Does NOT replace:** PRODUCT_FRAMING.md, BRAND_VOICE_SPEC.md, the IEI Brand System methodology, the legal package, or trademarks. All of that still applies.

---

## What changed and why

**Original intent (Tab's words):** *"easy-ish build, no-brainer price, for solopreneurs."*

**What we drifted into:** concierge premium service (Tab in loop for every customer, 3 tiers $997-$3,997, 60-min Zoom intake per customer, capped at 4-8 customers/week).

**Why the drift was wrong:** at $997 self-serve price, solopreneurs don't expect a Zoom call — they expect a tool. Concierge wrapper made it feel like an agency service, which raises both expectations AND ops cost. Path also caps revenue at Tab's hours.

**The pivot:** lead with self-serve at $997 (real no-brainer for solopreneurs), offer premium upgrade (+$1,000 Brand-Storming with Tab) AFTER delivery. Customer self-selects.

---

## The product, restated

### Core offer — Brand Blueprint
**$997 · One-time · Self-serve**

What the customer gets:
1. Conversational chat intake (10-20 min, mobile-friendly, "TAB SAYS" voice)
2. AI generates full brand foundation using The IEI Brand System
3. 5 business days later → email delivery with ZIP containing:
   - Brand Playbook (PDF)
   - 3 logo options + brand kit (SVG + PDF)
   - 1-page website (HTML)
   - GTM checklist customized to their stated goal
   - Brand messaging doc
4. No Zoom call required. No Tab in loop for the happy path.

### Premium upsell — Brand-Storming with Tab
**+$1,000 · Optional · After delivery**

In the delivery email: *"Want Tab to personally refine your Blueprint + spend 60 minutes with you on a Brand-Storming call? Upgrade: +$1,000."*

What they get:
1. 60-min Brand-Storming Zoom call with Tab (uses original intake-call-script.md)
2. Tab manually refines all deliverables based on the call
3. Re-delivery within 3 business days

This is the high-value capture for customers who want the human touch — they SELF-SELECT into it.

---

> **NOTE (2026-05-19 refinement):** The original hybrid pivot assumed Tab spot-checks 10% with full auto-delivery. **That changed.** Tab now reviews EVERY customer (15 min via structured form per `launch-assets/tab-review-prompt.md`), and customers receive a WATERMARKED PREVIEW before final delivery. Customer hits Accept (gets clean files) or Request Revisions or Decline+Refund. See `DECISIONS_LOG.md` for full lock + `launch-assets/customer-revision-flow.md` for the customer-side UX.

## Why this is better than either alternative

| Vs. concierge-only ($997-$3,997 with Tab in every call) | Vs. self-serve-only ($497 with no Tab option) |
|---|---|
| ✅ Scales beyond Tab's hours | ✅ Captures buyers willing to pay for Tab time |
| ✅ Solopreneurs can actually afford it | ✅ Higher avg revenue per customer (some take both) |
| ✅ Can run ads / mass outreach | ✅ Premium tier becomes the case-study generator |
| ✅ Tab time = paid (only for upgraders) | ✅ Tab time goes only where money flows |
| ❌ Some buyers might want Tab from the start | ❌ Easier to ship (but loses upsell revenue) |

Hybrid = best of both.

---

## The new launch timeline

**Was:** 5-7 days (concierge MVP — minimal automation needed because Tab did everything manually)
**Now:** **10-14 days** (self-serve MVP — chat UI + Stripe webhook + auto-delivery all become critical path)

Worth it because: self-serve scales infinitely once shipped; concierge caps at Tab's hours.

### Week 1 (Days 1-7) — Foundation + start the chat build

| Owner | Tasks |
|---|---|
| **Tab** | #4 attorney (tonight) · #5 trademarks · #15 domain · #16 video · **#17 vocab (URGENT)** · **#18 visuals (URGENT)** |
| **FE Dev** | #2 landing site (simplified to 1 tier) · start #8 chat UI |
| **BE Dev** | Start #19 chat API · start #21 Stripe webhook · prep #11 SKILL.md changes (waiting on Tab's #17+#18) |

### Week 2 (Days 8-14) — Wire the automation, ship

| Owner | Tasks |
|---|---|
| **Tab** | #3 Stripe Payment Links · #13 Notion dashboard · #14 outreach list · **#11 SKILL.md goes live** (once #17+#18 land) |
| **FE Dev** | Finish #8 chat UI · #20 review page (optional v2) |
| **BE Dev** | Finish #19 chat API · #22 auto-delivery email + ZIP · #23 premium upgrade flow |

### Week 3 (Days 15-21) — Test + soft-launch

| Owner | Tasks |
|---|---|
| **Tab** | #7 end-to-end test with friendly customer · send 20-prospect outreach · first paying customer onboarded |
| **FE Dev** | #24 spot-check dashboard |
| **BE Dev** | Bug fixes from #7 testing · monitor first real customer flow |

### Week 4+ (Days 22-30) — Real customers + iteration

| Owner | Tasks |
|---|---|
| **Tab** | Spot-check 10% of deliveries · capture testimonials · paid ads experiment · start Stage 2 cohort design |
| **Dev team** | #9 synthesis bridge (quality leap, now true Days 8-30 work) · #12 types.ts cleanup |

---

## Updated success metrics (the buyer-adoption test, sharper)

**Old (concierge):** 5 happy customers + 2 testimonials in 30 days.
**New (self-serve):** 30+ customers + 70%+ chat-completion rate + 4+ NPS avg + <10% refund rate in 30 days.

**Key new metric: chat-completion rate.** If people start the chat but bail, the intake UX is broken. Track religiously.

**Premium upgrade conversion target:** 15-25% of completed customers upgrade to Brand-Storming (+$1,000). Conservative: 10%. Optimistic: 30%.

---

## Updated economics

### Per-customer math (self-serve only)
- Revenue: $997
- Stripe fee: ~$29
- Anthropic API (chat + generation): ~$1.50
- Email delivery + hosting: ~$0.10
- Tab time: ~5 min spot-check (1 in 10)
- **Gross margin: ~96%**

### Per-customer math (premium upgrade)
- Total revenue: $1,997
- Stripe fees: ~$58
- Anthropic API: ~$2 (refinement adds a bit)
- Tab time: 60-min call + 90 min refinement ≈ 2.5 hrs
- **Effective Tab hourly: ~$400/hr on the upgrade portion**

### 30-day projection (revised, conservative)

| Scenario | Self-serve customers | Premium upgrades | Revenue | Tab hours |
|---|---|---|---|---|
| Pessimistic | 10 | 1 | $10,970 | ~5 |
| Realistic | 25 | 4 | $28,925 | ~15 |
| Optimistic | 50 | 10 | $59,850 | ~30 |

**Realistic month-1 net: ~$28K with Tab at 15 hrs/week.** Compare to old plan: ~$11K with Tab at 25 hrs/week. Better revenue AND less Tab time.

---

## Two questions still to lock

1. **Premium upgrade price:** I drafted as +$1,000 (total $1,997 if both). Alternatives:
   - +$497 (total $1,494) — softer upsell, higher conversion %, lower revenue per
   - +$1,500 (total $2,497) — premium signal, lower conversion %, higher revenue per
   - +$1,000 is the safe middle. Stays unless you say otherwise.

2. **Premium upgrade timing:** I drafted as "in the delivery email." Alternative: also surface as option DURING chat intake ("Want Tab to refine after AI delivers? Add it now for $X"). Pre-pay vs. post-pay psychology is different.
   - Pre-pay = higher conversion (already in buying mode), customer might not actually need it
   - Post-pay = lower conversion, but customer KNOWS they need it because they saw the AI output first
   - I'd recommend POST-PAY (after delivery) — feels less salesy + customer trusts you after seeing real work. But pre-pay would print more revenue per customer.

Default for now: **+$1,000 post-pay only.** Flag if you'd change.

---

## What didn't change

- The IEI Brand System methodology (still the spine)
- Tab's voice + proprietary phrases (still the AI's voice)
- Legal package (TOS + Privacy + IP Clickthrough cover both flows)
- Trademark filings (Brand Blueprint + IEI Ventures)
- Domain strategy (ieiventures.com/blueprint + register brandblueprint.com)
- Brand-playbook skill + SKILL_UPDATE.md edits (more urgent now, same content)
- Tab's $550/hr 1:1 consulting (still exists separately, premium upgrade is its productized cousin)
