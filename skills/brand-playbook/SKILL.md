---
name: brand-playbook
description: >
  Use this skill whenever Buzzy is building, creating, or developing a brand identity for a client.
  Triggers include: "build a brand for", "create a brand kit", "develop the brand identity",
  "we have a new client", "client only has a logo", "help me build out their brand",
  "brand foundation", "brand playbook", "fill out the brand worksheets", "evaluate this brand",
  "brand audit", or any time a client's brand needs to be created or documented from scratch.
  ALWAYS use this skill before building any brand assets (social templates, decks, landing pages,
  brand kits) — the playbook must be completed first. Works in three modes: Full Intake (client
  filled most info), Partial Intake + Creation (partial info, Claude infers and builds the rest),
  and Pure Creation (minimal info, Claude builds from scratch). Output is always a Brand Playbook
  delivered as both HTML and PDF using the presentation-pdf rendering pipeline.
---

# Brand Playbook Skill

Builds a complete Brand Playbook — a structured, designed document covering all 10 marketing
foundation worksheets — from any level of client input. This is the mandatory first step before
any brand asset is created.

## CRITICAL: NO BRAND-NAME BLEED

This document and its references mention many real brands by name as **examples of structure
and quality only** — including but not limited to: Aurelian Labs, Pen2Purpose, DOL Capital
Solutions, AceTV, FamFit, Wone, Banger, OffScript, Vent, Halcyon Credit Partners, Ideas Equal
Income, IEI Ventures.

**These names are NEVER content to copy.** Generate ALL content (brand name, tagline, mission,
vision, values, story, copy, palette interpretation) ONLY for the brand specified in the user's
intake. If you find yourself about to write any of the example brand names above into
brand.json, playbook.html, landing.html, or any other output file, STOP — that is a memory
leak and a critical defect.

The user's intake is the only source of truth for the brand being built. Treat every other
brand name in this document as anonymized — replace mentally with "[example brand]" before
incorporating any structural pattern.

---

## The 10 Foundational Documents (in build order)

These are the source frameworks. The playbook output erases the questionnaire format and
presents everything as a clean, professional brand reference — not a filled-out form.

1. **WS1 — Go-to-Market Checklist** (master framework, validates all other sections are complete)
2. **WS2 — Brand Identity** (core intake: name, tagline, essence, mission/vision/values, story, persona, competitors)
3. **WS3 — Brand Messaging** (derived from WS2: blurb, Instagram bio, copy pillars, value statements)
4. **WS4 — Brand Style Guide + Visual Assets Checklist** (colors, fonts, logo rules, asset inventory)
5. **WS5 — SMART Goals** (3–5 measurable brand/business goals with timelines)
6. **WS6 — Market Research + Competitor Analysis** (3 competitors: USP, strengths, weaknesses, opportunities, threats)
7. **WS7 — Target Audience + Customer Persona** (demographics, psychographics, behavioral profile, buying behavior)
8. **WS8 — Product Positioning** (per offering: features, benefits, pain points solved, value prop statement)
9. **WS9 — Niche Markets** (3–5 niche segments: trends, customer needs, pricing, distribution, key insights)
10. **WS10 — Dream 100** (ICA's top-of-mind desires, 12 pain points, where they're hiding)

Detailed prompts and field structure for each worksheet: see `references/worksheets.md`

---

## Step 0: Detect Mode

Before doing anything, assess what the client has provided. Match to one of three modes:

| Mode | Signal | Action |
|------|--------|--------|
| **Full Intake** | Client filled out most of a brand identity form or provided extensive background | Extract and map directly to all 10 worksheets |
| **Partial Intake + Creation** | Have logo, vision, service list, or partial details — gaps exist | Map what exists, Claude infers and creates the rest using brand logic |
| **Pure Creation** | Brand name + industry only, or nothing at all | Ask 5–7 targeted questions (see below), then build everything |

**For Pure Creation only — ask these questions once, then stop and build:**
1. What is the brand name and what does it do in one sentence?
2. Who is the ideal client (rough description)?
3. What are the 2–3 main products or services offered?
4. Who are 2–3 competitors or brands they want to be compared to?
5. What is the feeling or personality they want the brand to project? (3 words)
6. Do they have any existing colors, fonts, or visual preferences?
7. What does success look like for this brand in 12 months?

Do not ask more than these. Infer everything else.

---

## Step 0.5: Study the Exemplars

Before generating anything, read `references/exemplars/INDEX.md`. It is a routing guide for 7 real
IEI brand playbooks (AceTV, FamFit, Wone, Pen2Purpose, Banger, OffScript, Vent). Pick the **1–2
exemplars closest to this client** by industry, audience, and aesthetic — then read those
exemplars in full before drafting.

The exemplars are how the playbook gets to IEI's quality bar:
- HTML exemplars (`acetv.html`, `famfit.html`, `wone.html`, `pen2purpose.html`) carry real
  structural patterns, CSS, section ordering, and copy voice. Mimic the moves, not the content.
- PDF-extracted markdown exemplars (`banger.md`, `offscript.md`, `vent.md`) carry the brand
  voice, persona depth, and value-proposition language IEI ships. Match the depth, not the words.

**Do not skip this step.** Without exemplars, output drifts to generic LLM brand-deck filler.
With them, the model pattern-matches to IEI's actual deliverables.

---

## Step 1: Build the Brand Foundation (Internal)

Before writing any HTML, build the full foundation in your reasoning. Populate every section
for all 10 worksheets. If information is missing, **do not leave blanks** — infer from what
you know about the industry, the audience, and the brand's positioning. Flag inferences clearly
in the playbook with: `[Recommended — confirm with client]`

Cross-reference rule: every section must be internally consistent. The persona in WS7 must match
the audience in WS2. The competitor analysis in WS6 must reference competitors named in WS2.
The niche markets in WS9 must map back to the Dream 100 ICA in WS10.

**Load these pattern files before populating worksheets:**
- For WS2 (Brand Identity), WS3 (Brand Messaging), and any voice/copy work →
  `references/patterns/messaging-voice.md` — the IEI house voice, the "Informed Sibling" persona,
  Green-Light/Red-Light vocabulary, anti-patterns to avoid.
- For WS7 (Target Audience), WS9 (Niche Markets), WS10 (Dream 100) →
  `references/patterns/audience-personas.md` — Island A → Island B framing, Whale-vs-Vampire
  matrix, 4-Stage Tribal Funnel, named-individual ICA construction.
- For WS8 (Product Positioning), WS5 (SMART Goals), and offer/value-prop sections →
  `references/patterns/offer-frameworks.md` — Cure-Not-Commodity framing, Prescription Framework
  (Diagnosis → Cost of Inaction → Prescription → Mechanism → First Win → Risk Reversal),
  Universal Business Model Modifier, anti-discounting / capped-capacity pricing logic.

These patterns carry IEI's distinctive vocabulary. Use it. Don't translate it back to generic
agency-speak.

---

## Step 2: Design the Brand Kit

The brand kit is the visual backbone of the entire playbook. It must be designed — not listed.
Every element gets rendered visually: real color swatches, real font specimens at actual weights,
real logo lockup treatments. Reference the three approved brand kits as the design standard:
- Aurelian Labs Brand Kit v3 (institutional, dark-field, Cinzel/Playfair/Montserrat)
- Pen2Purpose Brand Identity Kit (literary, parchment-field, IM Fell/Libre Baskerville/Cormorant)
- DOL Capital Solutions Brand Kit (finance/growth, cream-field, Cormorant Garamond/Crimson Pro/Space Mono)

### Color Palette

**Before selecting any colors, load `references/color-theory.md` and apply the three-axis cross-reference:**
1. Industry archetype (Section 2 of color-theory.md) — what the category baseline expects
2. Target audience demographics (Section 3) — age group, gender, wealth tier, geography
3. Color psychology triggers (Section 1) — what each color does neurologically

**Hierarchy rule: audience > industry > aesthetic preference.** If the ICA is a 28-year-old
creative-class entrepreneur and the industry anchor says "navy," the audience profile overrides —
navy will feel too establishment for that ICA.

Color selection rules:
- Minimum 6 colors: Primary, Secondary, Accent, Background, Text, Muted/Neutral
- Every color gets: name, hex code, and a justification block (see color-theory.md Section 5 format)
- Use color-theory.md Section 4 contrast/pairing rules before finalizing any combination
- Apply the 60-30-10 rule across all layout decisions in the playbook itself
- Derive from brand personality and industry archetype if not provided:
  - Legacy/Finance/Institutional → dark greens, golds, onyx, parchment
  - Creative/Literary/Cultural → deep indigo, old gold, ivory, sepia
  - Growth/Wellness/Trust → teals, sage, cream, bronze
  - Tech/Modern/Bold → near-black, electric accent, silver, white
- Include a "do not use" color list with reason (e.g., "No pure white on dark field — use Parchment")
- If client has specified colors that conflict with theory, flag it: `[Client-specified — deviates from [X] — confirm intent]`
- Color chips MUST render as actual filled blocks, not text descriptions

### Typography
- Always 3 typefaces with explicit roles — never 1, never more than 3:
  - **Display/Heading font**: For logos, section titles, hero text. High personality font.
  - **Body font**: For paragraphs, descriptions, long-form content. Readable at small sizes.
  - **Accent/Label font**: For eyebrows, captions, UI labels, small-caps elements.
- Pull from Google Fonts — must be PDF-safe (loaded via `<link>` in `<head>`)
- Each font gets a specimen block showing it at its key weights and sizes
- Include explicit pairing rules:
  - Which font never goes below what size
  - Which combinations are forbidden
  - Whether serif/sans-serif rule applies (e.g., "strictly no sans-serif" for literary brands)
- Font pairings by brand archetype:
  - Institutional Finance → Cinzel (display) + Playfair Display (editorial) + Montserrat (body)
  - Literary/Heritage → IM Fell English (display) + Libre Baskerville (body) + Cormorant Garamond (accent)
  - Boutique Finance → Cormorant Garamond (display) + Crimson Pro (body) + Space Mono (accent)
  - Modern/Tech → Space Grotesk (display) + DM Sans (body) + IBM Plex Mono (accent)
  - Bold/Consumer → Bebas Neue (display) + Work Sans (body) + DM Sans (accent)

### Logo System

**Before documenting the logo system, load `references/logo-theory.md` and apply all applicable rules.**

**Step 1: Identify the logo type** (see logo-theory.md Section 1 — Wordmark, Lettermark, Pictorial Mark,
Abstract Mark, Combination Mark, Emblem, or Dynamic Mark). Type determines which rules govern.

**Step 2: Apply form and composition audit** (logo-theory.md Section 2):
- Simplicity check: does it read at 16px?
- Geometric anchoring: what primitive(s) is it built on?
- Visual weight balance: blur test — does the blur cloud center?
- Negative space audit: what does the space between elements form?

**Step 3: Apply color-in-logo rules** (logo-theory.md Section 3):
- Master rule: does it work in black on white first? If client-provided logo fails this, flag it.
- Color count: max 3 in primary version
- Dominance rule: one color >50% of the colored area
- If logo uses a gradient: document a required flat-color fallback version

**Step 4: Apply sizing and scaling rules** (logo-theory.md Section 4):
- Document minimum sizes (digital + print) for each variant
- Define the clear space exclusion zone as cap-height of first letter
- Specify required file formats per use case

**Step 5: Document forbidden treatments** (logo-theory.md Section 5):
- Pull all universally forbidden treatments
- Add any geometry-specific or construction-specific rules if applicable

The playbook documents the full logo variant system (logo-theory.md Section 6). Always include:
- **Primary mark** — full color on brand background (the "official" version)
- **Dark field variant** — for dark backgrounds, tech presentations, digital
- **Reversed/light variant** — for use on white or light backgrounds
- **All-black / production mark** — for embroidery, fax, legal, embossing, screen print
- **Monogram/seal** — icon-only version for app icons, email sigs, favicons, emboss
- **Horizontal lockup** (if default is stacked) — for nav bars, email headers, letterhead
- **Sub-brand variant** (if applicable)

Each variant gets a documentation card (see logo-theory.md Section 7 format) AND a visual mock
showing it on its approved background. Never show a logo floating on white alone.

### Visual Language
- Photography/imagery direction (e.g., "high contrast editorial, desaturated, no stock photo smiles")
- Icon style (line, filled, outlined, custom geometric)
- Pattern and texture usage (e.g., "etching texture on dark fields only", "circuit traces at 90°/45° only")
- Spacing philosophy (tight and institutional vs. airy and editorial)
- Border and divider treatment (gold rules, gradient fades, full-bleed bands)

### Social media sizing
Reference `references/social-sizes.md` for correct dimensions per platform when building the asset inventory.

---

## Step 3: Plan the Playbook Structure

The playbook is a multi-page designed document. Use **portrait format (850×1100px)** per page.
Organize into these sections — each may span multiple pages:

```
Cover                          — Brand name, tagline, "Brand Playbook" label, year
Brand Overview                 — Who they are, essence, personality in 3 words, brand story
Mission / Vision / Values      — Full statements, core values with brief explanations
Brand Messaging                — Blurb, Instagram bio, copy tone, value statements, brand voice
Target Audience                — Demographics, psychographics, behavioral profile, ICA description
Brand Style Guide              — Color palette (swatches), typography (specimens), logo rules, visual language
Product & Service Offerings    — Per offering: positioning, features/benefits, value prop
Competitive Landscape          — 3-competitor analysis, market positioning map
SMART Goals                    — 3–5 goals formatted as goal / metric / timeline cards
Market Niches + Dream 100      — Niche segments and where to find the ICA
Go-to-Market Roadmap           — 3-phase checklist derived from WS1
Back Cover                     — Brand contact info / "Confidential" label
```

Count pages before rendering. Brand playbooks typically run 18–28 pages.

---

## Step 4: Write PDF-Native HTML

Follow the **presentation-pdf skill** rendering rules exactly:
- Read `/mnt/skills/user/presentation-pdf/SKILL.md` before writing HTML
- Portrait page: `850px × 1100px` per `.page` div
- Screenshot pipeline: `device_scale_factor=3`, `--font-render-hinting=none`, PIL at 360 DPI
- Never use `page.pdf()` — always screenshot pipeline

### HTML Design Standards (from approved brand kits)

These patterns are extracted directly from the Aurelian Labs, Pen2Purpose, and DOL brand kits.
Apply them to every playbook — adapted to the client's brand, not copied verbatim.

**CSS Variable Architecture:**
Always open with a full `:root` block. Never hardcode colors or fonts inline:
```css
:root {
  --primary: [hex];       /* main background / authority color */
  --secondary: [hex];     /* secondary surface */
  --accent: [hex];        /* gold / highlight / CTA color */
  --accent-light: [hex];  /* lighter accent for borders, chips */
  --accent-dark: [hex];   /* darker accent for shadows, depth */
  --bg: [hex];            /* page background */
  --text: [hex];          /* primary text */
  --text-muted: [hex];    /* captions, labels, secondary copy */
  --border: rgba(...);    /* subtle divider color */
  --font-display: 'Font Name', serif;
  --font-body: 'Font Name', serif/sans;
  --font-accent: 'Font Name', mono/serif;
}
```

**Section Header Pattern (from all three kits):**
Every section opens with a numbered eyebrow label + gradient rule + section title:
```html
<p class="section-label">01</p>  <!-- accent color, small-caps, letter-spaced -->
<h2 class="section-title">Section Name</h2>
<p class="section-desc">One line of context in italics.</p>
```
The `.section-label` always has a gradient rule extending to the right:
```css
.section-label {
  font-family: var(--font-accent);
  font-size: 0.75rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--accent);
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0.4;
}
```

**Cover Page Pattern:**
- Full-bleed primary color background
- Top accent bar (3–4px, accent color)
- Gold/accent eyebrow label: "Brand Identity Kit · Version 1.0 · Year"
- Brand name in display font, large
- Tagline in italics or accent font
- Centered or bottom-left anchored layout
- Bottom nav strip showing document sections (like Aurelian's nav bar)
- Confidential label if applicable

**Dark Field vs. Light Field:**
- Dark field (primary color background): text in `var(--text)` white/ivory, accent color for labels
- Light field (parchment/cream background): text in `var(--charcoal)`, accent for dividers
- Section divider pages: full-bleed primary color, centered section title in display font
- Alternate between dark and light fields across sections for visual rhythm

**Color Swatch Cards:**
Never describe colors in text. Render real chips:
```html
<div class="color-card">
  <div class="color-swatch" style="background: #182F23; height: 120px;"></div>
  <div class="color-info" style="padding: 1rem;">
    <div class="color-name">Old Money Green</div>
    <div class="color-hex">#182F23</div>
    <div class="color-usage">Primary. Headers, backgrounds, prestige.</div>
  </div>
</div>
```
Arrange in a CSS grid: `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr))`

**Typography Specimen Block:**
Show each font rendered at its actual weight — never just list the name:
```html
<div class="type-specimen">
  <div style="font-family: var(--font-display); font-size: 2.5rem; font-weight: 700;">
    Capital. Discipline. Legacy.
  </div>
  <div class="type-meta">Cinzel · Display · 400/600/700/900 · Headers, logos, seals</div>
</div>
```

**Competitor / Offering / Goal Cards:**
Always use cards — never loose paragraphs for structured data:
```html
<div style="background: var(--surface); border: 1px solid var(--border); 
            border-left: 3px solid var(--accent); border-radius: 6px; padding: 24px;">
  <div class="card-eyebrow">Competitor 01</div>
  <h3 class="card-title">Brand Name</h3>
  <div class="card-body">Content here</div>
</div>
```

**Pull Quote / Callout Block:**
For brand story, voice examples, or founder quotes:
```html
<div style="border-left: 3px solid var(--accent); padding-left: 2rem; 
            font-family: var(--font-body); font-style: italic; font-size: 1.2rem;
            color: var(--text-muted);">
  "Quote text here"
</div>
```

**Divider Treatment:**
Always gradient-fade, never a hard line:
```css
.divider {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.3;
  margin: 4rem 0;
}
```

**The playbook must feel like the brand:**
- Literary/heritage brand (Pen2Purpose style): parchment backgrounds, gold gradient dividers,
  IM Fell + Baskerville, etching textures, deep indigo dark bands, no geometric elements
- Institutional finance brand (Aurelian style): dark green fields, gold circuit accents, Cinzel headers,
  formal Latin labels, bottom nav strips, strict column grids
- Boutique advisory brand (DOL style): cream fields, teal/gold palette, Cormorant Garamond,
  circular logo treatments, gradient radial backgrounds, airy spacing
- Never use the same template for different brand archetypes

---

## Step 5: Render + Deliver

Use the confirmed rendering function from `/mnt/skills/user/presentation-pdf/SKILL.md`.

Output both files:
- `/mnt/user-data/outputs/[BrandName]_Brand_Playbook.html`
- `/mnt/user-data/outputs/[BrandName]_Brand_Playbook.pdf`

Present PDF first, HTML second via `present_files`.

After delivery, output a **Brand Context Summary** in the conversation — a compact block
(not a file) that Claude can reference in subsequent sessions when building assets for this brand:

```
BRAND CONTEXT: [Brand Name]
Colors: [Primary] [Secondary] [Accent] [Background]
Fonts: [Display] + [Body]
Voice: [3-word personality]
ICA: [One sentence]
Offerings: [List]
Key competitors: [List]
```

---

## Quality Gates (check before rendering)

- [ ] Every section of all 10 worksheets is populated — no blanks
- [ ] All inferences are flagged with `[Recommended — confirm with client]`
- [ ] Colors, fonts, and voice are internally consistent across every page
- [ ] Competitor names in WS6 match WS2
- [ ] ICA in WS7 and WS10 describe the same person
- [ ] Product positioning in WS8 references pain points from WS7
- [ ] SMART goals in WS5 connect to the mission statement in WS2
- [ ] Playbook visually looks like the brand — not a default template
- [ ] Color swatches render as actual colored blocks (not text descriptions)
- [ ] Font specimens show fonts at their actual typeface/weight
- [ ] `num_slides` passed to `render_pdf()` matches exact `.page` div count
- [ ] Every palette color has a three-axis justification block (psychology × industry × audience) per color-theory.md Section 5 format
- [ ] Color contrast pairs checked — all text/background combinations pass minimum 4.5:1 ratio per color-theory.md Section 4
- [ ] 60-30-10 color weight rule applied across all layout pages
- [ ] Client-specified colors that conflict with theory are flagged with `[Client-specified — deviates from X — confirm intent]`
- [ ] Logo type identified and correct rules applied from logo-theory.md
- [ ] Logo passes black-on-white master rule (flagged if not)
- [ ] All required logo variants documented with visual mocks on approved backgrounds
- [ ] Logo minimum sizes (digital px + print inches) and clear space defined for each variant
- [ ] Forbidden logo treatments listed in the Logo System section
- [ ] Logo color count ≤ 3; dominance rule confirmed (one color >50% of colored area)

---

## Reference Files

- `references/worksheets.md` — Full field-by-field prompts for all 10 worksheets
- `references/social-sizes.md` — Social media image dimensions by platform
- `references/color-theory.md` — Color psychology × industry archetype × audience demographics cross-reference (load during Step 2 palette selection)
- `references/logo-theory.md` — Logo typology, form/composition, color-in-logo rules, sizing, scaling, variant system, forbidden treatments (load during Step 2 logo system)
- `references/exemplars/INDEX.md` — Routing guide for 7 real IEI playbooks; load during Step 0.5, then read the 1–2 closest matches in full
- `references/exemplars/{acetv,famfit,wone,pen2purpose}.html` — HTML exemplars (structure, CSS, voice patterns)
- `references/exemplars/{banger,offscript,vent}.md` — PDF-extracted exemplars (voice, persona depth, value-prop language)
- `references/patterns/messaging-voice.md` — IEI house voice, Informed Sibling persona, copy do/don'ts (load during Step 1 for WS2/WS3)
- `references/patterns/audience-personas.md` — Island A→B framing, Whale-vs-Vampire matrix, ICA construction (load during Step 1 for WS7/WS9/WS10)
- `references/patterns/offer-frameworks.md` — Cure-Not-Commodity, Prescription Framework, pricing logic (load during Step 1 for WS5/WS8)
