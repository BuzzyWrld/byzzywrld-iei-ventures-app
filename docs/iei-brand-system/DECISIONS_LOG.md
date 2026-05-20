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
| – Website | ✓ | |
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

## Notes for dev team

- This is a **living document**. Every Tab call/text/message that contains a decision gets logged here.
- Use this as the authoritative source if `PRODUCT_FRAMING.md` and conversation history disagree.
- Anything marked OPEN or TBD = do not assume, ask.
