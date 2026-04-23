# Voice and Feel — IEI Ventures Platform Brand

This is direction for the **platform's own** brand (how IEI Ventures presents itself to its users — the agencies and businesses using the tool). Distinct from the brand systems it *generates for clients*.

Pulled and extrapolated from `01-developer-brief.html`.

---

## Positioning

> An AI-powered brand development and lead generation platform — from intake to identity to income.

The product takes a business from *nothing* or *incomplete* to a complete brand system + landing page + lead flow, in one pass. Positions as the shovel: white-labeled by agencies (Vendasta, marketing fulfillment providers) and sold to SMBs.

---

## Audience

1. **Agency operators** (primary) — B2B, enterprise marketing fulfillment companies. Think Vendasta product managers. They need the platform to feel *turnkey, credible, and safe to white-label.*
2. **Direct advisory clients** (secondary) — founders and marketing leads who want a brand system built without a full agency engagement.

Both audiences are operators, not designers. They value: professionalism, speed, tangibility of outputs, legibility.

---

## Tone

- **Confident, not flashy.** The product does serious work (brand identity is expensive and high-stakes). UI shouldn't feel like a toy or a Dribbble piece.
- **Clear over clever.** No jargon, no "reimagining" or "empowering" copy. Plain-English labels.
- **Warm but professional.** Not a cold enterprise SaaS (think Ramp, Linear, Arc), not a consumer app either.
- **Conversational in the intake flow.** The brief calls out: "feels like a brand strategist, not a form." The questionnaire screens specifically should feel like a dialog.

---

## Aesthetic reference points (feel, not copy)

- **Linear** — dense information, beautiful typography, keyboard-first, status states done well
- **Vercel** — monochrome + accent, geometric, fast-feeling
- **Ramp** — serious, type-driven, B2B with taste
- **Arc / The Browser Company** — the intake "conversational" steps could borrow their wizard feel
- **Notion** — clean document surfaces where brand outputs are displayed

Avoid:
- "AI product" clichés (gradient blobs, sparkle icons, purple/pink glow everywhere)
- Playful SaaS (illustrations of little people carrying boxes)
- Over-designed marketing-page aesthetics in the app itself

---

## Visual system guidance

Since the platform needs to feel neutral enough to **be white-labeled**, the default palette should be:
- A restrained primary (deep neutral or dark ink — not a loud brand color)
- One accent color used sparingly
- Plenty of white/neutral space
- Strong typography as the main visual element

When a tenant brands it (Vendasta, etc.), their colors swap in via `TenantConfig.colors`. Design should show gracefully with any primary color pair.

**Typography:** Geist is already installed. A serif option for display/hero moments (Instrument Serif, Fraunces, or similar) could give the "brand strategist" feel in the intake flow. Suggest — don't require.

**Density:** Prefer generous whitespace over cramming. This is a high-trust product; pacing matters.

**Motion:** Tasteful, purposeful. Status transitions (pending → running → complete) should have subtle movement. No decorative animation.

---

## Don't

- No emojis in the product UI (brief includes them decoratively but they shouldn't appear in the app)
- No financial data or revenue language anywhere — FINRA compliance (explicit in brief slide 07)
- No "crystal ball" / "magic" framing for the AI — the product does real work, positioned as such
- No marketing-funnel copy in the product (no "Supercharge your…", no "Unlock…")

---

## One-line aesthetic brief

*A tool a serious agency would put in front of their enterprise client with a straight face, that still feels modern enough a founder would want to use it themselves.*
