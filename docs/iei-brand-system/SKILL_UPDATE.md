# SKILL.md Updates — Add IEI Brand System Awareness

**File:** `skills/brand-playbook/SKILL.md`
**Purpose:** Make the existing brand-playbook skill produce IEI-Brand-System-structured outputs that match Tab's methodology, not generic brand-deck filler.

**Strategy:** Surgical additions to the existing SKILL.md (not a rewrite). Five edits + two new reference files. Existing skill structure (Step 0 mode detection, three modes, 10 worksheets, quality gates) all stays.

---

## Edit 1 — NEW section at top, right after frontmatter, before "# Brand Playbook Skill"

```markdown
---

## CRITICAL: THIS SKILL BUILDS BRAND BLUEPRINTS, NOT GENERIC BRAND DECKS

This skill is the engine behind **Brand Blueprint** — a productized version of Tab Wolod's
proprietary methodology, **The IEI Brand System**. Every output must reflect that methodology.

The IEI Brand System has 6 modules:
1. **One Brilliant Idea** — What you love + What you're good at = the one idea worth building
2. **Who Are You?** (ABCs of Branding — Authentic Brand Creation) — Identity, Story, Mission, Voice, Secret Sauce
3. **Who Are They?** — Demographics, Psychographics, Dream 100 Lite (where to find them)
4. **What Do They Need?** (The 6-Part Offering Framework) — Who · Problem · What · Inputs · Deliverables · Outcome · Price
5. **The Narrative** (The 7-Part Story) — Origin · Why · Struggle · Turning Point · Who You Serve · How You Help · The Invitation
6. **Content & Comms** (The 5-Post Framework — Awareness 50% · Trust 30% · Convert 20%)

The brand foundation builds via "**The Fourfold Path to Meaningful Marketing**" — Ideation → Impact → Implementation → Income.

**Every brand.json must include an `ieiBrandSystem` block** populated for all 6 modules.
**Every playbook.html must use IEI module names as section titles** ("Your One Brilliant Idea,"
"The ABCs of Your Brand," "Who You Serve," "Your Offering," "Your Narrative," "Your Content Engine").

See `references/iei-brand-system.md` for full methodology detail.

---
```

## Edit 2 — UPDATE the "## The 10 Foundational Documents (in build order)" section

Add an IEI mapping column to the existing worksheet table:

```markdown
## The 10 Foundational Documents — Mapped to IEI Brand System

| # | Worksheet | IEI Module | Owner field in brand.json |
|---|---|---|---|
| WS1 | Go-to-Market Checklist | Synthesis (Fourfold Path) | `ieiBrandSystem.fourfoldPath` |
| WS2 | Brand Identity | Module 2 | `ieiBrandSystem.module2_whoYouAre` |
| WS3 | Brand Messaging | Module 2 + 5 | `ieiBrandSystem.module5_narrative.messaging` |
| WS4 | Brand Style Guide | Module 2 (visual) | `ieiBrandSystem.module2_whoYouAre.visual` |
| WS5 | SMART Goals | Module 1 + 4 | `ieiBrandSystem.module1_brilliantIdea.goals` |
| WS6 | Competitor Analysis | Tab's "brands you admire" intake question | `ieiBrandSystem.module3_idealClient.brandsAdmired` |
| WS7 | Customer Persona | Module 3 | `ieiBrandSystem.module3_idealClient.persona` |
| WS8 | Product Positioning | Module 4 | `ieiBrandSystem.module4_offering` |
| WS9 | Niche Markets | Module 3 (Dream 100 Lite) | `ieiBrandSystem.module3_idealClient.dream100` |
| WS10 | Dream 100 | Module 3 (Layer 3) | `ieiBrandSystem.module3_idealClient.dream100` |
```

## Edit 3 — ADD before "## Step 1: Build the Brand Foundation (Internal)"

```markdown
## Step 0.7: Populate the IEI Brand System Block

Before writing any other section, populate the `ieiBrandSystem` block in brand.json. This block IS the
brand foundation — every downstream output reads it. Required structure:

```json
{
  "ieiBrandSystem": {
    "module1_brilliantIdea": {
      "iLove": "string — what they love (verbatim from intake)",
      "iAmGoodAt": "string — what they're good at (verbatim)",
      "theMarriage": "string — the one-sentence brilliant idea (verbatim from intake)",
      "goals": { "sixMonth": "string", "twelveMonth": "string" }
    },
    "module2_whoYouAre": {
      "identity": "string — Q1 answer: who are you",
      "whatYouDo": "string — Q2 answer: plain language activities",
      "whoYouServe": "string — Q3 answer: specific person",
      "whyYouStandOut": "string — Q4 answer: story + method + results",
      "howYouDoIt": "string — Q5 answer: secret sauce",
      "oneLiner": "I help [WHO] do [WHAT] so they can [WHY]",
      "missionStatement": "1 sentence",
      "visionStatement": "1 sentence",
      "coreValues": ["3-5 short phrases with 1-sentence explanations"],
      "voice": { "say": ["..."], "dont": ["..."] },
      "secretSauce": "1-2 sentences — their proprietary method/process"
    },
    "module3_idealClient": {
      "demographics": { "age": "...", "stage": "...", "geography": "...", "occupation": "..." },
      "psychographics": {
        "values": "string",
        "fears": "string",
        "whatKeepsThemUpAtNight": "string",
        "whatTheyveAlreadyTried": "string",
        "whatTheySayWhenStuck": "string (in their voice)",
        "deepWant": "string"
      },
      "dream100Lite": {
        "platforms": ["..."],
        "podcasts": ["..."],
        "influencers": ["..."],
        "communities": ["..."],
        "searchTerms": ["..."]
      },
      "brandsAdmired": ["from intake — 2-3 brands the customer wishes to emulate"],
      "oneLineICA": "My ideal client is [SPECIFIC PERSON]. Their #1 pain is [PAIN]. I reach them at [PLATFORM]."
    },
    "module4_offering": {
      "who": "...",
      "problem": "...",
      "what": "format · length · delivery",
      "inputs": "...",
      "deliverables": ["..."],
      "outcome": "the transformation",
      "price": "...",
      "offerStatement": "I offer [NAME] — a [FORMAT] for [WHO], that helps them [PROBLEM], by delivering [DELIVERABLES], so they can [OUTCOME]. Investment: $[PRICE]."
    },
    "module5_narrative": {
      "origin": "200 words — how it started",
      "why": "150 words — what would disappoint them if this didn't exist",
      "struggle": "150 words — what they went through to figure it out",
      "turningPoint": "100 words — the moment things clicked",
      "whoYouServe": "100 words — why them specifically",
      "howYouHelp": "100 words — your method as the solution",
      "theInvitation": "100 words — why your offer is THE answer",
      "hookLine": "ONE sentence that makes someone say 'that's me'",
      "messaging": { "blurb": "...", "igBio": "...", "copyPillars": ["..."] }
    },
    "module6_content": {
      "fivePostFramework": [
        { "type": "awareness_teach", "hook": "...", "body": "...", "cta": "..." },
        { "type": "awareness_story", "hook": "...", "body": "...", "cta": "..." },
        { "type": "trust_proof", "hook": "...", "body": "...", "cta": "..." },
        { "type": "trust_connection", "hook": "...", "body": "...", "cta": "..." },
        { "type": "convert_offer", "hook": "...", "body": "...", "cta": "..." }
      ],
      "masterAiPrompt": "full prompt with customer's brand identity populated",
      "contentPillars": ["3-5 pillars"],
      "weeklyRhythm": "e.g., Mon teach, Wed story, Fri offer"
    },
    "fourfoldPath": {
      "ideation": { "weeks": "1-2", "tasks": ["8-12 specific tasks"] },
      "impact": { "weeks": "3-4", "tasks": ["8-12 specific tasks"] },
      "implementation": { "weeks": "5", "tasks": ["5-8 specific tasks"] },
      "income": { "weeks": "5-6", "tasks": ["5-8 specific tasks"] }
    },
    "proprietaryPhrases": ["5-7 phrases unique to this brand, generated by synthesis"]
  }
}
```

**Every field is required.** If intake is sparse, infer per Step 1 (no blanks). Flag inferences with
`[Inferred — confirm with client]` in the playbook, but never leave a JSON field empty.
```

## Edit 4 — UPDATE the "## Step 3: Plan the Playbook Structure" section

Replace the existing page list with this IEI-aligned structure:

```markdown
## Step 3: Plan the Playbook Structure (IEI-aligned)

The playbook is a multi-page designed document. Portrait format (850×1100px) per page.
Organize per the IEI Brand System modules:

```
Cover                            — Brand name, tagline, "Brand Blueprint" label, year
The Idea (Module 1)              — One Brilliant Idea, the marriage statement
Who You Are (Module 2)           — Identity, story, mission, vision, values, voice
Your Visual Identity (Module 2)  — Color palette (real swatches), typography, logo system
Who You Serve (Module 3)         — Demographics, psychographics, Dream 100 Lite, ICA
Your Offering (Module 4)         — 6-part framework, offer statement, value-based price
Your Narrative (Module 5)        — 7-part story, hook line, messaging blurbs
Your Content Engine (Module 6)   — 5-Post Framework, content pillars, weekly rhythm
The Fourfold Path                — 6-week GTM roadmap (Ideation → Impact → Implementation → Income)
The Brand Cheat Sheet            — 5 questions, 1 page, keep this
Back Cover                       — "Long live the light bulb moments" + contact
```

Each module page should:
- Open with the IEI module name and one-sentence framing ("Your One Brilliant Idea — the thing
  at the intersection of what you love and what you're good at")
- Contain the customer's populated content from the `ieiBrandSystem` block
- End with a "LOCK IT IN" callout — the locked sentence/statement from that module
- Use IEI proprietary phrases verbatim where applicable

Count pages before rendering. IEI Brand Blueprints typically run 18-24 pages.
```

## Edit 5 — ADD to "## Quality Gates" (existing list, append these)

```markdown
- [ ] brand.json contains complete `ieiBrandSystem` block — all 6 modules + fourfoldPath populated
- [ ] No empty fields in `ieiBrandSystem` (inferences flagged in playbook only, not in JSON)
- [ ] Playbook section titles use IEI module names ("Your One Brilliant Idea," "The ABCs of Your Brand," etc.) — NOT generic ones ("About," "Mission")
- [ ] Every module page in playbook ends with a "LOCK IT IN" callout
- [ ] At least 3 proprietary IEI phrases appear verbatim in playbook.html ("Ideas Equal Income," "From Idea to Income," "Long live the light bulb moments," "Lock It In," etc.)
- [ ] Customer's brilliant-idea statement appears verbatim in cover + Brand Cheat Sheet
- [ ] The 6-Part Offering Framework page uses Tab's exact offer template format: "I offer [NAME] — a [FORMAT] for [WHO]..."
- [ ] The 7-Part Narrative page is in CUSTOMER's voice with their verbatim phrases preserved (not paraphrased)
- [ ] Banned vocabulary check per BRAND_VOICE_SPEC.md
```

---

## New reference file — `skills/brand-playbook/references/iei-brand-system.md`

This is a NEW file. Create it with this content (full IEI methodology reference, server-only):

> NOTE: this file pulls heavily from Tab's proprietary IP. Server-only — never expose to client browser.

```markdown
# The IEI Brand System — Methodology Reference

[Full reference would be ~6-8 pages of methodology drawn from the facilitator guide. Below is the
outline — fill in with content from docs/iei-brand-system/source/ as needed. Treat all of this as
proprietary IP.]

## The 6 Modules — Full Detail

### Module 1: One Brilliant Idea
- Concept: "What you love + What you're good at = The one idea worth building"
- Two-column exercise (Things I Love · Things I'm Good At)
- The "cat cafe" silly example for unlocking thinking
- Key teaching: "You're not starting from zero — you're starting from experience"
- LOCK IT IN: "I love X, I'm good at Y, so my Brilliant Idea is Z."

### Module 2: Who Are You? (ABCs of Branding)
- The "brand is like a baby" metaphor
- Authentic Brand Creation (A.B.C.s)
- The 5 Defining Questions (in plain human language, not corporate-speak):
  Q1: Who are you? (energy, vibe, story)
  Q2: What do you actually do? (plain language activities)
  Q3: Who do you do it for? (specific person)
  Q4: What makes you stand out? (story + method + results)
  Q5: How do you do it? (secret sauce)
- LOCK IT IN: "I help [WHO] do [WHAT] so they can [WHY]."

### Module 3: Who Are They? (Dream 100 Lite)
- "Everyone is not your client"
- Three layers: Demographics · Psychographics · Where to find them
- Psychographics is the most important layer (what keeps them up at night, what they've already tried)
- "If you can say what your client is thinking better than they can — they will trust you instantly"
- "Push past the first obvious answer"
- LOCK IT IN: "My ideal client is X. Their #1 pain is Y. I reach them at Z."

### Module 4: What Do They Need? (6-Part Offering Framework)
- The 6 questions: Who · Problem · What · Inputs · Deliverables · Outcome · Price
- Three packaging criteria: Scalable · Specific · Low cost to entry
- Value-based pricing: price the transformation, not the time
- "You can't just say I do brand strategy. That's not an offering. That's a category."
- LOCK IT IN: "I offer [NAME] — a [FORMAT] for [WHO], that helps them [PROBLEM], by delivering [DELIVERABLES], so they can [OUTCOME]. Investment: $[PRICE]."

### Module 5: The Narrative (7-Part Story)
- Origin · Why · Struggle · Turning Point · Who You Serve · How You Help · The Invitation
- "I didn't give you a bio. I told you my narrative."
- "Your story is your strategy"
- The hook line = the ONE sentence that makes someone say "that's me"
- LOCK IT IN: The hook line.

### Module 6: Content & Comms (5-Post Framework)
- Awareness 50% · Trust 30% · Convert 20%
- Post 1: Awareness — Teach Something
- Post 2: Awareness — Share Your Story
- Post 3: Trust — Show Proof
- Post 4: Trust — Connection Post (speak to ideal client's pain)
- Post 5: Convert — Present Your Offer
- Master AI Prompt for ongoing content
- LOCK IT IN: Brand Cheat Sheet (5 questions, 1 page)

## The Fourfold Path to Meaningful Marketing

The 6-week go-to-market sequence:

- **Step 1 — Ideation (Weeks 1-2):** Brand identity, SMART goals, mission/vision/values, brand voice, style guide, associated assets
- **Step 2 — Impact (Weeks 3-4):** Market research, competitor analysis, customer persona, product positioning, channels, Dream 100
- **Step 3 — Implementation (Week 5):** Content development, keyword research, content pillars, content calendar
- **Step 4 — Income (Weeks 5-6):** Sales strategy, pricing, CRM, revenue forecasting, pre-launch

## Tab's Voice (apply to all customer-facing copy in playbook)

[Pull from BRAND_VOICE_SPEC.md — proprietary phrases, banned vocabulary, rhythm, confront+comfort, cultural specificity.]
```

---

## New reference file — `skills/brand-playbook/references/iei-voice-rules.md`

Copy `docs/iei-brand-system/BRAND_VOICE_SPEC.md` into `skills/brand-playbook/references/iei-voice-rules.md` so the brand-playbook agent loads it as a system-prompt reference.

---

## Update `src/lib/skills/agent-sdk.ts` REFERENCE_FILES list

Add these two lines to the `REFERENCE_FILES` const:

```ts
const REFERENCE_FILES = [
  // ...existing references...
  // IEI Brand System (added 2026-05-18)
  "references/iei-brand-system.md",
  "references/iei-voice-rules.md",
];
```

This makes both new references load into every brand-playbook generation call.

---

## Order of operations

1. Day 1 — Create the two new reference files (.md content above)
2. Day 1 — Update `src/lib/skills/agent-sdk.ts` REFERENCE_FILES
3. Day 1 — Apply Edits 1-5 to `skills/brand-playbook/SKILL.md`
4. Day 1 — Update `src/lib/types.ts` — add `ieiBrandSystem` block to `BrandJson` type
5. Day 1 — Test with one sample intake → verify generated playbook uses IEI module names + proprietary phrases
6. Day 2+ — Iterate if voice/structure drift detected

Total effort: ~1 dev day for these updates.

---

## Validation test

After updates, run this test:

1. Use existing `/new/deep` form with sample intake
2. Trigger brand-playbook generation
3. Open generated `brand.json` — verify `ieiBrandSystem` block populated for all 6 modules
4. Open generated `playbook.html` — verify:
   - Section titles match IEI module names
   - At least 3 IEI proprietary phrases appear verbatim
   - "LOCK IT IN" callouts present
   - No banned vocabulary
5. If any fails: regenerate with sharper prompt; if still fails, escalate to Tab

If passes: proceed to use updated SKILL for first paying customer.
