# Decisions Log — running record

**Purpose:** Every confirmed product decision Tab makes lives here. Source of truth for the dev team.
**Format:** Decision · Date · Status (CONFIRMED / OPEN / TBD-pending-info).

---

## North star

| Decision | Status | Note |
|---|---|---|
| **MVP primary test = Buyer adoption** | CONFIRMED 2026-05-18 | Capacity and quality are secondary tests. Build choices favor adoption when in tension. |
| Product = Tab's "IEI Brand System" productized, not generic AI brand kit | CONFIRMED 2026-05-18 | Per `PRODUCT_FRAMING.md` |
| Live workshop relationship | OPEN | Replace / compete / feed? Tab to send strategy doc. |
| MVP price | OPEN | Tab to send monetization strategy doc. Likely > $1,300 given deliverable depth. |

---

## Product name / umbrella

| Decision | Status | Note |
|---|---|---|
| Parent brand = **IEI Ventures** (umbrella) | CONFIRMED 2026-05-18 | Landing/marketing under IEI Ventures |
| Product name | OPEN | Candidates: **"Build your Brand in a Box"** · **"Brand Playbook"** · **"Brand Blueprint"** |

---

## Scope / what ships in MVP

| Decision | Status | Note |
|---|---|---|
| Keep existing brand-playbook skill, tweak and build on it | CONFIRMED 2026-05-18 | Not throwing it out |
| Rebuild UI from scratch | OPEN | Tab "up in the air" — likely yes given new framing |
| All 6 modules in MVP | TBD | Tab: "build out what the full playbook looks like then break down the MVP" |
| Core MVP deliverables (Tab's words): | CONFIRMED 2026-05-18 | Quality > quantity |
| – Brand Messaging | ✓ | |
| – Quick cards that pop | ✓ | |
| – Brand Kit with quality logo | ✓ | |
| – Easy copy/paste to Canva | ✓ | |
| – Website | ✓ | See override below — was 1 site, now 3 versions |
| – GTM catered checklist based on their goals | ✓ | |
| "Existing brand" path as v1 differentiator, visible on preview | CONFIRMED 2026-05-18 | Keep — must show when user previews |
| English only | CONFIRMED 2026-05-18 | |
| Mobile responsive | CONFIRMED 2026-05-18 | Must work on mobile |

---

## UX

| Decision | Status | Note |
|---|---|---|
| Intake = conversational chat | CONFIRMED 2026-05-18 | Tab prefers chat |
| Chat must be NON-CHUNKY, NON-JARGON | CONFIRMED 2026-05-18 | "people who don't know marketing won't know" — language must be approachable, plain |
| Chat assistant feature post-generation | CONFIRMED 2026-05-18 | "a chat feature would be dope" — likely for ongoing brand Q&A |
| Tab-in-loop review for early customers | CONFIRMED 2026-05-18 | Tab reviews before delivery in early MVP — capacity bottleneck but adoption insurance |

---

## Payments + ops

| Decision | Status | Note |
|---|---|---|
| Stripe for checkout | CONFIRMED 2026-05-18 | |
| Hosted (not self-hosted by customer) | CONFIRMED 2026-05-18 | "I'm thinking we will have to host" |

---

## Legal / IP / Privacy — CRITICAL

| Decision | Status | Note |
|---|---|---|
| IP protection is non-negotiable | CONFIRMED 2026-05-18 | Tab: "Flag the legal piece, facts. I need that privacy and legal use piece FACTS and IP" |
| Need real legal review on: | TBD | |
| – Tab's facilitator guide / framework as IP (never expose in user-facing prompts) | OPEN | Engineering: server-side only, never inlined in client-visible LLM calls |
| – Customer data privacy (chat transcripts contain personal stories) | OPEN | Needs privacy policy, retention policy, encryption at rest, GDPR/CCPA |
| – Customer IP (their ideas, story, brand) | OPEN | Needs TOS — customer owns their output, IEI owns the framework |
| – Generated logos vs. trademark collisions | OPEN | TOS shifts liability to user; consider trademark API check at scale |
| – Live session IP agreement parallel (per facilitator guide Step 2) | OPEN | Tab's live workshop has explicit IP agreement — digital MVP needs equivalent |
| – AI-generated content ownership | OPEN | Who owns what the AI produces? Standard answer: customer owns outputs, IEI owns the system that produced them |

---

## Open items waiting on Tab

- [ ] Decision on live workshop relationship (replace / compete / feed)
- [ ] Decision on Canva templates (link her existing vs generate) — currently leaning LINK her existing
- [ ] Exact wording for "brands you admire/emulate" intake question
- [ ] Confirmation: use "TAB SAYS" scripts verbatim as AI voice, or abstract voice rules only
- [ ] Domain name for Brand Blueprint (brandblueprint.io? buildbrandblueprint.com? something via ieiventures.com?)
- [ ] Backup product name candidates in case "Brand Blueprint" trademark is opposed

---

## Newly captured from facilitator guide (added 2026-05-18, late session)

| Insight | Implication |
|---|---|
| **Tab already has an "Idea to Income Diagnostic" at $250** as introductory offer (Calendly: https://calendly.com/ideasequalincome/idea-to-income-diagnostic) | Brand Blueprint at $997+ is the NEXT tier above the Diagnostic — validates Option C pricing. The Diagnostic stays as the entry-level offering; Brand Blueprint is the productized full-system version. |
| **Tab's UVP has evolved through 3 stages** (websites → brand + website → ideas to income) | Customer-facing copy should not lock the UVP — leave room for evolution. Brand Blueprint generates static outputs; live customer relationships evolve. |
| **The D.U.M.I story** (Jaydee saying "you know it better than I do") is the catalyst story for IEI | Worth referencing in Tab's video script + landing page as origin moment. Already in landing copy. |
| **"Your brand is like a baby" metaphor** is Tab's core teaching tool for Module 2 | Add to BRAND_VOICE_SPEC.md as recurring metaphor — done. |
| **Value-based pricing testimonial:** "I gave her the system. She generated a few thousand dollars. She knows she can keep generating thousands." | Reference in landing as proof of value-based outcomes. Pull as quote once Tab confirms attribution. |
| **The Reveal Moment in Module 5** ("I didn't give you a bio. I told you my narrative.") | Use as section opener in playbook's narrative section. |

---

## New decisions confirmed 2026-05-18 (post GTM-plan review)

| Decision | Status | Note |
|---|---|---|
| **Parent company structure: IEI Ventures = holding company; Brand Blueprint = product under it** | CONFIRMED | Per GTM doc. Each product brand leads in customer-facing materials; IEI Ventures stays behind the scenes in legal/investor contexts. |
| **Product name: BRAND BLUEPRINT** | CONFIRMED | (Beat "Build your Brand in a Box" and "Brand Playbook") |
| ~~Stage 1 pricing tiers (Option C 3-tier)~~ | **SUPERSEDED 2026-05-19** | See Hybrid Pivot below |
|   – ~~Blueprint Basic: $997~~ | | |
|   – ~~Blueprint + Content: $1,997~~ | | |
|   – ~~Full Suite: $3,997~~ | | |

---

## 🔄 HYBRID PIVOT — confirmed 2026-05-19 (during Tab's Monday afternoon session)

**Tab's reasoning:** "This was supposed to be an easy-ish build for solopreneurs at a no-brainer price. The concierge premium design drifted from that. I want people to use the app and buy."

**New product structure:**

| Decision | Status |
|---|---|
| **Single core offer: $997 self-serve Brand Blueprint** | CONFIRMED 2026-05-19 |
| **Premium upgrade: +$1,000 Brand-Storming with Tab, offered POST-delivery** | CONFIRMED (default — Tab can revisit pricing) |
| **No Zoom intake call required** (chat UI replaces it) | CONFIRMED |
| **Tab spot-checks 10% of deliveries** (not every one) | CONFIRMED |
| **Auto-delivery email + Stripe webhook** (no manual Tab intervention) | CONFIRMED |
| **Chat UI promoted from Days 8-30 to Week 1 critical path** | CONFIRMED |
| **Launch timeline revised: 10-14 days** (was 5-7) | CONFIRMED |
| **Pricing model: hybrid (self-serve front door + premium upsell)** | CONFIRMED |

**What success now looks like (revised metrics):**
- Old: 5 customers + 2 testimonials in 30 days
- **New: 30+ customers + 70%+ chat-completion rate + 4+ NPS avg + <10% refund rate**
- Premium upgrade target: 15-25% of customers convert

See `HYBRID_PIVOT.md` for full reasoning + revised economics + Q1-Q4 timeline.

---

## 🔄 DELIVERY MODEL REFINEMENT — confirmed 2026-05-19 (late session)

**Tab put structure around the delivery + refund flow. Locks below replace earlier draft.**

| Decision | Status |
|---|---|
| **AI generation completes in ~30 min** | CONFIRMED |
| **Tab reviews EVERY customer (not 10% spot-check)** | CONFIRMED — 15 min/customer × ~50/month = ~12 hrs/month |
| **Tab uses a STRUCTURED tweak prompt** (checkbox form, not free-write) | CONFIRMED — see `launch-assets/tab-review-prompt.md` |
| **Marketed SLA: "Within 24 hours"** | CONFIRMED — typically 2-6 hrs business-day, max 24 |
| **Customer receives WATERMARKED preview** (not final files) | CONFIRMED — major UX + IP protection win |
| **Customer "ACCEPTS" to receive clean final files** | CONFIRMED — explicit acceptance moment |
| **Acceptance closes refund window** (except production defects) | CONFIRMED |
| **Refund policy:** *"Love it or your money back. 7 days from delivery preview, full refund, no questions asked."* | CONFIRMED |
| **Refund requires customer to confirm deletion of preview files** | CONFIRMED — IP protection |
| **Production defects warrant fix/refund anytime** (margin off, corrupted file, missing page, etc.) | CONFIRMED |
| **Customer revision flow:** Click "Request Revisions" in email → returns to chat → AI asks 1-2 clarifying questions → regenerates | CONFIRMED |
| **Welcome video records in same session as landing hero video** | CONFIRMED — Task #16 covers both |
| **Build philosophy:** Tab + Claude design strategy/UX, dev team implements | CONFIRMED |
| **NEW DOC: `TABS_STORY.md` — Tab's full backstory in her voice** | TO DRAFT — source of truth for About page, press kit, voice reference |
| **Domain strategy:** | CONFIRMED 2026-05-18 late session | |
|   – Stage 1 landing: **ieiventures.com/blueprint** | ✓ | Ships fast, no extra domain to buy |
|   – Register brandblueprint.com (or similar) in parallel | ✓ | For long-term product identity; redirect later |
| **Stage 1 GTM motion: one-to-one sales, concierge delivery, Tab in loop fully** | CONFIRMED | Per GTM doc Stage 1; chat UI deferred to days 8-30 |
| **Tab's bandwidth for sales + review: 20 hrs/week** | CONFIRMED | Implies capacity cap at ~6-8 customers/week |
| **Launch target: Friday May 22 (stretch) / Monday May 25 (realistic)** | CONFIRMED 2026-05-18 | Original "this week" target slips by 3-5 business days due to legal + landing site lead time |
| **Bankroll path priority (per GTM doc):** revenue-funded first → customer-funded → non-dilutive → raise (last) | CONFIRMED | |
| **Stripe Payment Links for Stage 1** (not custom Stripe SDK integration) | CONFIRMED | Cuts ~1 week of engineering |
| **Trademark filing: BRAND BLUEPRINT + IEI VENTURES, file ASAP** | CONFIRMED | DIY via USPTO TEAS Plus or paralegal-supported (~$700 total) |
| **Optional trademark consideration: "Ideas Equal Income", "The IEI Brand System", "From Idea to Income", "Lock It In"** | TBD | Discuss with attorney |

---

---

## 🎙️ VOCABULARY + VOICE LOCK — 2026-05-20

Tab completed the brand vocabulary session (Task #17). Full additions captured in `BRAND_VOICE_SPEC.md` under "ADDITIONS FROM TAB VOCABULARY SESSION — 2026-05-20." Locked:

| Decision | Status |
|---|---|
| **18+ new proprietary Tab phrases — all confirmed for verbatim use** | CONFIRMED 2026-05-20 |
| **"Brand Ethos" as new IEI concept** (broader than identity — includes identity, origin, pillars, why, essence) | CONFIRMED 2026-05-20 |
| **Tab Affirmation Mode as a third voice layer** (BOOM! · THAT'S IT · Now we're cooking with the hot sauce · Go head · Speak your truth · Wow · No judgement · I'm proud of you) | CONFIRMED 2026-05-20 |
| **Word preferences:** Founder/Entrepreneur > business owner. Investment > purchase. Brand Ethos > brand identity. Tribe/Ideal client context-dependent. | CONFIRMED 2026-05-20 |
| **"What is marketing?" — Tab definition = full GTM system, not promo** | CONFIRMED 2026-05-20 |
| **Anti-hustle-culture philosophy: "smarter not harder"** | CONFIRMED 2026-05-20 |
| **Banned/cautioned:** "side hustle" (for customers), "hustle culture" (push back), "manifest your dreams" (→ "make your idea tangible") | CONFIRMED 2026-05-20 |
| **Energy rules per customer scenario** (pricing, perfectionism, emotional why, brave goal, niche resistance) | CONFIRMED 2026-05-20 |

## 🛠️ PRODUCT ASKS FROM VOCABULARY SESSION (already tasked + design questions for team)

Tasks created from vocabulary session — for transparency:
1. **Task #28** — Self-identification + pronoun field in chat intake (FE+BE)
2. **Task #29** — "Long live the light bulb moments" transition screen between modules (FE)
3. **Task #30** — URGENT: Privacy + anonymization refinement (BE + Legal)

Design decisions to lock in the upcoming team meeting (NOT yet tasked):
4. **"Brand Ethos" concept explanation** on landing/delivery — needs a teaching moment in the customer journey
5. **Pre-purchase intake preview / vetting** so customer knows what they're getting into before Stripe checkout
6. **Recommendation engine for "I'd advise against it" moments** — AI provides recommendation + caveat when customer's stated choice conflicts with best practice, but respects their final call

---

---

## 🌐 DELIVERABLE EXPANSION — 3-PAGE WEBSITE (2026-05-21)

Tab expanded the website deliverable from 1 page to **3 pages**. Approved during Stripe setup conversation.

| Page | Purpose | Content sources from intake |
|---|---|---|
| **Home** | Hero (offering + 1-liner) + about preview + how-to-buy CTA + contact footer | Q4 (what you do) + Q24 (offering) + Q26 (6-month goal) |
| **About** | Story + mission/vision/values + founder section | Q10-Q15 (story) + Q8-Q10 (mission/vision/values) |
| **Flex page** | Customer-selected: services / products / events / booking links / mix | NEW Q24b in chat intake (`flexPageType`) |

**Stripe product description updated** to remove Tab's name + IEI Brand System reference, and to reflect 3-page website. Tab confirmed test-mode setup with $0 payment link first.

**Affected files (all updated 2026-05-21):**
- landing-page-copy.md
- chat-intake-questions.md (NEW Q24b added)
- email-templates.md
- STAGE1_LAUNCH_PLAN.md
- HYBRID_PIVOT.md
- TEAM_TASKS.md + TEAM_BUILD_PLAN.md
- README.md
- launch-assets/tab-video-script.md
- launch-assets/soft-launch-outreach.md
- legal/TERMS_OF_SERVICE.md

**New task created:** Task #31 — BE dev updates SKILL.md to generate 3 HTML files (home.html, about.html, flex.html) instead of single landing.html. Required for MVP launch.

---

## 🎨 BRAND BLUEPRINT VISUAL IDENTITY — confirmed 2026-05-21

Full spec: `BRAND_BLUEPRINT_VISUAL_IDENTITY.md`

| Decision | Status |
|---|---|
| **Direction: "Crafted Vibrant"** — hybrid sister-brand identity inheriting IEI lineage | CONFIRMED |
| **Strategic positioning:** sister brand under IEI Ventures (family resemblance via cream + IEI Yellow + adjacent lightbulb mark) | CONFIRMED |
| **AI agent has NO NAME for MVP** — referred to as "your brand strategist" | CONFIRMED |
| **Logo MVP:** simple "Brand Blueprint" wordmark in Inter Black + adjacent IEI lightbulb. Custom integrated mark = v2. | CONFIRMED |
| **Palette:** Cream #FAF6EF · Charcoal #1A1A1A · IEI Yellow #FFD400 · Bold Coral #E94F37 · Deep Indigo #1B2A4E | CONFIRMED |
| **Typography:** Inter (single family, free, Google Fonts). Display weight 900. | CONFIRMED |
| **Mode A vs Mode B usage map** locked for every product surface | CONFIRMED |
| **v2 deferred:** custom logo with designer (~$500), Söhne typography upgrade (~$500), branded illustration system | OPEN — funded after Stage 1 revenue |

## 🚶 DELIVERABLE WALKTHROUGH UX — confirmed 2026-05-21/25

Replaces the simple Accept/Decline button flow from earlier hybrid pivot. Full spec updated in `launch-assets/customer-revision-flow.md`.

| Decision | Status |
|---|---|
| **Customer email opens guided walkthrough** (one deliverable per screen) | CONFIRMED |
| **Each screen has ✓ "I've seen this" checkmark** — saves progress server-side, resumable | CONFIRMED |
| **Customer can re-open any deliverable at any time** | CONFIRMED |
| **Summary screen offers Accept / Request Revisions / Decline** after all ✓ | CONFIRMED |
| **7-day auto-acceptance** if no action taken (protects against ghosting) | CONFIRMED — TOS Section 4f added |
| **Day-4 + Day-6 reminder emails** before auto-acceptance | CONFIRMED — email-templates.md updated |
| **Auto-acceptance notification email** on Day 7 | CONFIRMED |
| **NEW TASK #34:** Build walkthrough UI (FE: Buzzy · BE: auto-signoff timer for Henrique) | OPEN |

## 🔧 BACKEND REPO + TASTE-SKILL COORDINATION — confirmed 2026-05-21/25

Tab coordinated with the BE dev (Henrique/Enrique) on infrastructure:

| Decision | Status |
|---|---|
| **`content-engine` branch merges to `main`** | IN PROGRESS — pre-merge checklist in flight |
| **Separate visual references repo** also merges into main | IN PROGRESS — coordination with dev team |
| **The "taste skill"** = web-scour template matcher that finds website templates matching customer's competition/industry/vibe. Distinct from VISUAL_REFERENCES.md taste catalog. | CONFIRMED |
| **Complementary architecture:** `VISUAL_REFERENCES.md` taste rules + 12 aesthetic families = AI generation choices · Taste-skill web-scour = real-world template references for AI to mimic structurally | CONFIRMED |

---

## 🎨 WEBSITE DELIVERABLE — 3 VIBE VERSIONS — Henrique override 2026-05-26

**Background:** Tab's 2026-05-21 call locked the deliverable as **ONE** 3-page website (home / about / flex) sharing one brand visual system. See `src/lib/variants/landing.ts` header (pre-2026-05-26 version) for the original spec.

**Henrique's override (2026-05-26):** Each customer now ships with **THREE** complete 3-page website versions, each in a distinct vibe. All three vibes use the same brand foundation (mission, voice, positioning, colors) but apply different typography, color emphasis, and layout signature so the customer compares three aesthetic interpretations and picks one to edit. The customer's reasoning: "I want each separate website template to have its own vibe/theme/color/fonts. But the pages themselves obviously have the same fonts" (intra-vibe consistency, inter-vibe distinction).

| Decision | Status |
|---|---|
| **3 vibe versions × 3 pages each = 9 HTML outputs** | CONFIRMED 2026-05-26 — Henrique |
| **Vibes are deterministic per brand** — picked from 5 base vibes by industry + archetype, see `src/lib/variants/vibes.ts` | CONFIRMED 2026-05-26 |
| **5 base vibes anchored to Tab's FIVE FLAVORS** in `references/design-anatomy.md` (Editorial Density · Type-as-Art · Vintage Diaspora Poster · Pattern-as-Branding · Cinematic Street Pop Art) | CONFIRMED 2026-05-26 |
| **Within a vibe, all 3 pages share fonts + color strategy + layout signature** — they're one cohesive site, not three random pages | CONFIRMED 2026-05-26 |
| **Across vibes, fonts + accent + layout differ deliberately** — so the customer sees real choice | CONFIRMED 2026-05-26 |
| **Token cost:** ~3× the previous build (9 calls vs 3, ~$2 extra per build on OpenRouter Claude 3.7 Sonnet — within $997 unit economics) | NOTED |
| **Tab loop-in:** Henrique to DM Tab about this so she's not surprised when she sees the change | OPEN |

---

## Notes for dev team

- This is a **living document**. Every Tab call/text/message that contains a decision gets logged here.
- Use this as the authoritative source if `PRODUCT_FRAMING.md` and conversation history disagree.
- Anything marked OPEN or TBD = do not assume, ask.
