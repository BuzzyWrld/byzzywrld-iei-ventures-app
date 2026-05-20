# Monday Morning Checklist — Tab's First Day of Launch Week

**Date:** Monday May 19, 2026
**Goal:** End the day with attorney booked, trademark filed, landing copy approved, domain secured, and first prospect outreach drafted.

**Time budget:** 6 focused hours (with breaks). Don't try to do this in 3 hours — you'll skip things that matter.

---

## ☕ Pre-flight (8:30-9:00 AM, 30 min)

Before any work:

- [ ] Coffee. Real one.
- [ ] Phone on Do Not Disturb except for family
- [ ] Close every browser tab except the ones you need
- [ ] Read this checklist top to bottom
- [ ] Read `DECISIONS_LOG.md` — verify nothing changed overnight
- [ ] Open `LEGAL_CHECKLIST.md`, `landing-page-copy.md`, `soft-launch-outreach.md` in tabs

**Decide right now:** which 6 hours today are your focused work hours? Block them on your calendar. Mine the calendar wisely.

---

## 🏛 HOUR 1 — 9:00-10:00 AM — ATTORNEY OUTREACH (most important hour)

This is the launch blocker. Do it first while your energy is high.

**Step 1 — Make a shortlist of 3 attorneys (15 min)**
Search criteria:
- Startup / tech transactions attorney
- SaaS + IP experience
- Located in your state (or barred in your state)
- 5+ years experience
- Solo practitioners or boutique firms (better pricing than Big Law for this scope)

Where to look:
- Google: `"startup attorney" SaaS "[your city]"`
- Avvo.com — filter by Tech/Startup
- LinkedIn search: "startup lawyer" + your city
- Ask 1-2 founder friends for recs (DM them now)

**Step 2 — Send outreach email to all 3 (30 min)**
Template:

```
Subject: Brand Blueprint — startup launch, need legal package in 7-10 days

Hi [Attorney Name],

I'm Tab Wolod, founder of IEI Ventures. I'm launching a digital product called Brand Blueprint within the next two weeks and need legal foundation in place before I can take Stripe payments.

Specifically I need:
- Terms of Service (B2C / B2 small biz, AI-generated content disclosures)
- Privacy Policy (US-only initially, CCPA-compliant)
- IP / Confidentiality click-through agreement at checkout
- Quick consult on entity structure (IEI Ventures as parent holding 3 product LLCs vs. product lines within one LLC)
- Trademark filing strategy for 2-3 marks

I've attached:
- Product framing document
- Legal checklist with specifics
- Plain-English first drafts of TOS, Privacy, IP clickthrough (saves you drafting time)

Could we do a 60-min initial consult this week? My availability: [LIST 3 TIME WINDOWS THIS WEEK]

Budget range I'm working with: $1,500-$3,500 for this package, with potential ongoing retainer if we're a good fit.

Thanks,
Tab Wolod
Founder, IEI Ventures
twolod@ieiagency.com
[YOUR PHONE]
```

Attach:
- `docs/iei-brand-system/PRODUCT_FRAMING.md`
- `docs/iei-brand-system/LEGAL_CHECKLIST.md`
- `docs/iei-brand-system/launch-assets/legal/TERMS_OF_SERVICE.md`
- `docs/iei-brand-system/launch-assets/legal/PRIVACY_POLICY.md`
- `docs/iei-brand-system/launch-assets/legal/IP_CLICKTHROUGH.md`

**Step 3 — Set a follow-up timer for 4 PM today (15 min)**
If you haven't heard back from any of 3 by 4 PM, send 1 follow-up text/call to the most-promising one.

---

## 🏷 HOUR 2 — 10:15-11:15 AM — TRADEMARK FILING

**Step 1 — TESS clearance search (20 min)**
Go to: https://tmsearch.uspto.gov

Search for:
- "Brand Blueprint" (Class 042 — SaaS/software)
- "IEI Ventures" (Class 035 + 042)
- Note any close matches that could cause opposition. Screenshot any concerning hits.

If matches exist that look problematic → bring to attorney call before filing.
If no problematic matches → proceed to file.

**Step 2 — File via USPTO TEAS Plus (30 min each, ~$350 each)**
Go to: https://teas.uspto.gov

For each mark:
- Choose TEAS Plus (cheaper, faster — $250-$350 per class)
- Word mark only for now (logo trademark later)
- Specify goods/services from the pre-approved ID list (Class 042: "Software as a service (SaaS) services featuring software for [brand development / brand identity creation]")
- Filing basis: "Section 1(b) Intent to Use" if you haven't sold yet, or "Section 1(a) Use in Commerce" once you have first sale
- Specimen: not required for intent-to-use; required for use-in-commerce
- Pay with credit card

**Step 3 — Save filing receipts (5 min)**
USPTO emails confirmation with serial number. File these as part of IEI Ventures legal records.

---

## ☕ BREAK — 11:15-11:30 AM

Stand up. Walk around. Eat something.

---

## 🌐 HOUR 3 — 11:30 AM-12:30 PM — DOMAIN + INFRASTRUCTURE

**Step 1 — Confirm ieiventures.com is yours (5 min)**
Log into your domain registrar (Namecheap, GoDaddy, whoever). Verify:
- Domain active
- WHOIS privacy on
- DNS pointing where you want it
- Expiration date > 1 year out

**Step 2 — Register brandblueprint.com (10 min)**
Per the domain strategy decision, register `brandblueprint.com` in parallel. Even if you don't use it yet, claim it now (~$15/yr). If taken, try:
- thebrandblueprint.com
- brandblueprint.app
- brandblueprint.co
- getbrandblueprint.com

Buy ONE. Set DNS to redirect to `ieiventures.com/blueprint` for now.

**Step 3 — Decide landing build path (15 min)**

| Path | Effort | Cost | Decision driver |
|---|---|---|---|
| **Framer (recommended)** | 1-2 days | $25/mo | You can edit it yourself going forward, beautiful templates |
| **Webflow** | 1-2 days | $40/mo | Same as Framer, slightly different aesthetic |
| **Custom Next.js in existing repo** | 3-4 days | $0 | Dev team builds, you can't edit easily |
| **Carrd.co (super basic)** | 2 hours | $19/yr | Bare-bones, OK for stub, not great for conversion |

**Recommendation:** Framer. Sign up at framer.com. Pick a clean template. Build today/tomorrow.

**Step 4 — Set up the build container (30 min)**

If Framer:
- Sign up
- Connect ieiventures.com as custom domain (or subdomain ieiventures.com/blueprint if Framer supports it)
- Pick template — recommend something modern + minimal, NOT corporate

If asking dev team to build in repo:
- Send them `landing-page-copy.md` + `DEV_HANDOFF.md`
- Schedule a 15-min sync to align on look/feel and timeline

---

## 🥗 LUNCH — 12:30-1:30 PM

Eat. Walk. Do not check email.

---

## ✍️ HOUR 4 — 1:30-2:30 PM — REVIEW LANDING COPY + APPROVE

**Step 1 — Read `landing-page-copy.md` end-to-end (30 min)**
Print it out or open on a real screen, not phone. Read like a customer.

For each section, mark:
- ✅ Approved as-is
- ✏️ Edit (write the edit in the margin)
- ❌ Remove
- 🤔 Need to think about

**Step 2 — Make the edits in the file directly (20 min)**
Open the file. Apply your edits. Save.

**Step 3 — Send to whoever is building the landing site (10 min)**
Slack/email them the updated `landing-page-copy.md`. Tell them:
- "Copy is final, ready to flow into the design"
- "Mobile-first"
- "Three Stripe Payment Link URLs coming Wednesday (after I set them up)"
- "Hero video placeholder is fine — I'm recording Thursday"

---

## 🎬 HOUR 5 — 2:30-3:30 PM — RECORD TAB VIDEO (or schedule)

If you're feeling on-camera energy today: record the 90-sec hero video using script in `tab-video-script.md`.

Tech requirements:
- Phone or Loom or Riverside
- Good lighting (window light or ring light)
- Plain backdrop OR your real workspace
- Headphones for audio playback
- One take, no script-reading

If you're NOT feeling on-camera today: schedule a 60-min recording session for Wednesday or Thursday. Block calendar.

**Don't skip this.** The video is the single highest-impact trust-building asset on the landing page.

---

## 📱 HOUR 6 — 3:30-4:30 PM — BUILD THE 20-PROSPECT LIST

Per `soft-launch-outreach.md`:

- Open new doc — "Brand Blueprint Soft Launch Outreach List"
- Brainstorm 20 names that fit one of these categories:
  - Past brand clients (warmest)
  - Founder friends who've been "stuck"
  - LinkedIn network with active business activity
  - IG followers who've engaged with your content recently
- For each: write the personalization hook (the SPECIFIC THING)
- DO NOT SEND YET — that's tomorrow

**Why not send today?** Because today you're getting infrastructure in place. Outreach without infrastructure = "I'd buy, what's the link?" → you panic → bad first impression. Build first, send tomorrow.

---

## 🏁 END OF DAY (4:30-5:00 PM, 30 min)

**Verify the launch-blocker chain:**

- [ ] Attorney outreach sent to 3 people
- [ ] At least 1 response or follow-up scheduled for tomorrow
- [ ] Trademarks filed (Brand Blueprint + IEI Ventures)
- [ ] Trademark filing receipts saved
- [ ] Domain confirmed (ieiventures.com + brandblueprint.com)
- [ ] Landing build path decided + builder briefed
- [ ] Landing copy reviewed + edits made + sent to builder
- [ ] Video either recorded OR scheduled
- [ ] 20-prospect list built (not sent yet)

**Tomorrow's plan (Tuesday):**
- 9 AM: Attorney follow-ups
- 10 AM: Start sending soft-launch outreach (7 warmest)
- 11 AM: Check on landing site progress
- 1 PM: Record Tab video if not done Monday
- 3 PM: Send next 7 outreach messages
- 4 PM: Tab-in-loop ops setup — Calendly intake call template, Stripe Payment Links setup, email templates loaded into your email tool

---

## ⚠️ If you fall behind today

**Priority cuts if you only have 4 hours:**
1. Attorney outreach (DO)
2. Trademark filing (DO)
3. Domain confirmation (DO)
4. Landing copy approval (DO — but quick read, not deep edit)
5. ⏭ Video recording (push to Tuesday)
6. ⏭ 20-prospect list (push to Tuesday)

**If you only have 2 hours:**
1. Attorney outreach (DO)
2. Trademark filing (DO)
3. ⏭ Everything else (push to Tuesday)

The two non-negotiables are attorney outreach and trademark filing. Both are time-sensitive (attorney turnaround takes days; trademark filing date matters for priority).

---

## What to NOT do today

❌ **Don't tweak the legal docs.** They're attorney-review-ready. Don't second-guess them.
❌ **Don't redesign the landing copy.** It's done. Review + edit, don't rewrite.
❌ **Don't reach out to cold prospects yet.** Day 2 work.
❌ **Don't post on social.** Day 2-3 work, after the landing is live.
❌ **Don't book customer intake calls.** Need Stripe + landing + legal first.
❌ **Don't try to learn Framer/Webflow tonight.** Either build during Hour 3 in flow, or assign to dev team.

---

## You're going to feel one of these by 4 PM. Here's what to do.

**"This is moving!"** → Good. Keep going. Cap at 6 hours. Don't burn out.

**"I'm overwhelmed."** → Normal. Close this checklist. Do ONE thing — the attorney email. Then go for a walk. Come back to the rest tomorrow.

**"I need to redo the docs first."** → Resist. The docs are 80% right; 80% right shipped beats 100% right unshipped. Ship.

**"I want to add another tier / change pricing / rename it."** → STOP. Decision was locked. Re-opening = launch delay. Make a "v2 ideas" list, dump it there, get back to launch.

**"This is going to fail."** → Normal launch-day fear. Look at the cost: $700 trademark + $1,500-$3,500 attorney + $50-200/mo tooling. Worst case = $4,200 spent, you learned a lot, and you have IP filed. Best case = you have a real business in 30 days. Both are wins.

---

Long live the light bulb moments.

Get moving.
