# Brand Blueprint — Visual Identity Spec

**For:** Buzzy (FE design + landing site build) · Henrique (email templates, watermark style, any BE-rendered surfaces) · Tab (final approval)
**Locked:** 2026-05-21 (Brand Blueprint visual identity design session)
**Direction:** "Crafted Vibrant" — hybrid sister-brand identity inheriting IEI lineage via shared accent + wordmark adjacency
**Source:** Tab's 5 strategic answers + IEI 2026 social content reference + Framer brand inspiration + Tab's past visual work (VISUAL_REFERENCES.md catalog)

---

## 🎯 Strategic positioning

**Brand Blueprint = sister brand under IEI Ventures.** Visually it stands on its own, but it carries IEI traits:

- **Family resemblance carriers:** shared cream warmth, shared yellow accent, IEI lightbulb logo placed adjacent to the Brand Blueprint wordmark (not merged into it for MVP)
- **What's distinctly Brand Blueprint:** the heavy display typography stack, the bolder color commitments (coral/red high-energy accents), the product-as-art layout sensibility, the AI-but-feels-human warmth
- **Customer experience target:** *"Oh wow — this isn't regular AI. It feels human."*

**The AI in the chat is referred to as "your brand strategist."** No proper name in MVP. Tab is the human face; the strategist is the AI Tab built.

---

## 🎨 Color Palette — locked hex codes

### Primary palette (use 90% of the time)

| Name | Hex | Usage |
|---|---|---|
| **Cream** | `#FAF6EF` | Default page background. Warm off-white, NOT stark white. |
| **Charcoal** | `#1A1A1A` | Primary text color. NOT pure black. Slightly softer. |
| **IEI Yellow** | `#FFD400` | Brand accent (carrier from IEI). Highlighter, brush-stroke underlines, buttons, callout chips, brand mark. |
| **Bold Coral** | `#E94F37` | High-energy moments only — primary CTAs ("Buy Brand Blueprint"), urgency callouts, hover states. SPARING use. |
| **Deep Indigo** | `#1B2A4E` | Premium/institutional surfaces — investor decks, press kit, landing hero background, dark mode for dashboard. |

### Support palette (functional UI + secondary surfaces)

| Name | Hex | Usage |
|---|---|---|
| **Light Cream** | `#FDFBF6` | Cards, modals, secondary surfaces on cream pages |
| **Soft Gray** | `#E5E0D5` | Borders, dividers, disabled states |
| **Muted Body** | `#4A4A4A` | Secondary text, captions, helper text |
| **Success Green** | `#2E7D32` | Functional UI states (form success, "checkmark" in walkthrough) |
| **Warning Amber** | `#F57C00` | Functional UI warnings (refund pending, etc.) |
| **Error Red** | `#C62828` | Functional UI errors only — distinct from Bold Coral CTAs |

### Rules

- Default ratio: **Cream 60% · Charcoal 25% · IEI Yellow 10% · Bold Coral 5%** (per 60-30-10 rule, with coral as the 5% punch)
- Deep Indigo: ONLY for surfaces where institutional gravitas is wanted (hero landing, premium tier descriptions, investor materials)
- NEVER use: tech-startup gradients (blue→purple), neon, pastel-girlboss palette, glowing AI-node colors
- Yellow + Coral can coexist but not at equal weight — Yellow leads, Coral punctuates

### Tailwind config snippet (drop into `tailwind.config.js`)

```js
theme: {
  extend: {
    colors: {
      cream: '#FAF6EF',
      'cream-light': '#FDFBF6',
      charcoal: '#1A1A1A',
      'charcoal-muted': '#4A4A4A',
      'iei-yellow': '#FFD400',
      'bold-coral': '#E94F37',
      'deep-indigo': '#1B2A4E',
      'soft-gray': '#E5E0D5',
      'ui-success': '#2E7D32',
      'ui-warning': '#F57C00',
      'ui-error': '#C62828',
    },
  },
},
```

---

## 🔤 Typography — locked

### Font family (single-family approach for MVP simplicity)

**Inter** — free, Google Fonts, well-supported, geometric sans with display weights that hit hard.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
```

### Type scale (mobile-first)

| Role | Font | Weight | Size (mobile / desktop) | Use case |
|---|---|---|---|---|
| **Hero display** | Inter | **900 (Black)** | 48px / 80px+ | Landing hero, "Lock It In" moments |
| **H1** | Inter | **900 (Black)** | 36px / 56px | Page titles |
| **H2** | Inter | **700 (Bold)** | 28px / 36px | Section heads |
| **H3** | Inter | 700 | 22px / 26px | Sub-sections |
| **Eyebrow** | Inter | 600 (SemiBold) | 12px / 14px UPPERCASE, letter-spaced 0.1em | Section labels above headlines |
| **Body** | Inter | 400 (Regular) | 16px / 17px, line-height 1.6 | Standard paragraphs |
| **Body emphasis** | Inter | 500 (Medium) | 16px / 17px | Inline emphasis |
| **Caption** | Inter | 400 | 13px / 14px | Helper text, captions |
| **Button** | Inter | 600 (SemiBold) | 15px / 16px | CTAs |

### v2 typography upgrade path

If/when budget allows + Tab wants more character:
- **Display:** swap to **Söhne Breit** (paid, ~$500 license) — what Framer uses, premium
- **Or:** **Manrope** (free, Google Fonts) — slightly more personality than Inter

Don't do this in MVP. Inter ships fine.

### Typography rules

- Display weights MUST take up real space — never small + Black weight (looks broken)
- Eyebrows always UPPERCASE + letter-spaced
- Headlines can be lowercase for warmth (matches IEI 2026 social content energy)
- Body always sentence case, conversational
- NEVER use italic Inter for emphasis — use Medium weight or yellow highlighter instead

---

## 🖋 Logo — MVP simple wordmark

### MVP version (ship this)

**"Brand Blueprint" wordmark** set in **Inter Black, tight letterspacing (-0.02em).**

- Always paired with **IEI Ventures lightbulb mark** at smaller scale (adjacent, not integrated) — provides family resemblance
- Wordmark color: **Charcoal on cream backgrounds · Cream on dark backgrounds**
- Lightbulb mark color: **IEI Yellow always** (never recolored)

### Layout variants needed (Buzzy to produce)

| Variant | Use | Format |
|---|---|---|
| **Horizontal lockup** | Default — most surfaces, landing nav, email headers | "[bulb] Brand Blueprint" inline |
| **Stacked lockup** | Square contexts, social profile pics | Bulb on top, wordmark below |
| **Wordmark only** | When IEI Ventures lockup appears elsewhere on the page (no need to repeat) | "Brand Blueprint" alone |
| **Bulb mark only** | Favicon, app icon, very small surfaces | IEI Yellow bulb on cream OR charcoal |
| **Reversed (dark bg)** | Dark hero sections, watermark, dark mode | Cream wordmark + yellow bulb |

### v2 evolution

When Tab has budget + a designer:
- Custom letter treatment on the **B** — subtle echo of the lightbulb shape inside the B's counter (the closed loop)
- Spend ~$300-$800 with a freelance brand designer (1-2 days)
- Until then, simple wordmark IS the brand — clean and confident beats half-done custom

---

## 📸 Photography & Imagery rules

### Primary direction
- **Real Tab moments** (until customer testimonials accumulate)
- **Real customer brand examples** (post-launch, with explicit written permission per IP clickthrough)
- **Behind-the-scenes / process / Tab-at-work** photography for landing About section

### Stock fallback (when unavoidable)
- Use **vintage B&W stock photography** overlaid with **warm gradient blobs** (orange-coral-yellow blend) — matches IEI 2026 social content style
- NEVER use generic startup stock (laptop + coffee, woman-pointing-at-whiteboard, diverse-team-smiling)
- NEVER use AI-generated imagery (breaks the "feels human" promise)

### Imagery don't-do
- No glowing AI nodes / circuit-board graphics
- No robot icons or AI clichés
- No 3D-rendered abstract shapes (Spotify Wrapped style — overdone)
- No drop shadows on photography (flat layering only)
- No tilted/skewed photo frames (clean rectangles + intentional cutouts only)

### Decorative element library

- **Yellow brush-stroke underline** — under key words for emphasis (matches IEI 2026 style)
- **Yellow highlighter block** — behind 1-2 word phrases for "highlighter" effect
- **Yellow chevron arrows (>>>)** — directional cues, "next" indicators, list bullets (Tab's recurring motif)
- **Warm gradient blob** — soft orange-pink-coral cloud as background element (NOT corner-to-corner gradient — discrete blob shapes)
- **Subtle paper texture** — cream backgrounds can have very light paper grain (5-8% opacity max)

---

## 🗺 Mode A vs Mode B usage map (every product surface)

### Mode A — "Warm Conversation"
**Cream base + Charcoal text + IEI Yellow accents + occasional Bold Coral CTAs**
Use for: anywhere the customer is being TALKED TO. Warm. Personal. Tab-voice.

### Mode B — "Premium Sophistication"
**Deep Indigo base + Cream text + IEI Yellow singular accent**
Use for: institutional credibility moments. Premium positioning. Investor/partner-facing.

### Surface map

| Surface | Mode | Notes |
|---|---|---|
| Landing hero (top fold) | **Mode B** | Deep Indigo background + cream type + yellow CTA. Premium signal. |
| Landing "Meet Tab" / About section | **Mode A** | Warmth. Tab's photo + cream + her story in charcoal type + yellow highlighter on key phrases. |
| Landing pricing card ($997) | **Mode A** | Cream card with yellow accent on price · Bold Coral on "Get Started" CTA |
| Landing FAQ | **Mode A** | Conversational |
| Landing footer | **Mode B** | Indigo strip with cream type · IEI Ventures lockup |
| Chat intake — Welcome Moment | **Mode A** | Cream + Tab welcome video + warm CTA |
| Chat intake — question turns | **Mode A** | Cream chat bubbles + charcoal text + yellow chevron progress |
| "Lock It In" transitions (between modules) | **Mode A with yellow highlight burst** | Quick yellow brushstroke animation across the screen behind the phrase |
| Stripe checkout page | (Stripe-controlled — minimal branding) | Just brand logo + clean |
| Welcome email (post-purchase) | **Mode A** | Cream HTML email + charcoal type + yellow accents + Tab signature |
| Day-after-intake email | **Mode A** | Same |
| Delivery email (walkthrough trigger) | **Mode A** | Strong visual = "Your draft is ready" + cream background + yellow chevron CTA |
| Deliverable walkthrough screens | **Mode A primary** | Each screen: cream background + deliverable preview + yellow checkmark on complete |
| Watermark on preview files | Subtle **Mode B** | "PREVIEW · BRAND BLUEPRINT · IEI VENTURES" in low-opacity Deep Indigo, diagonal repeat at 30% opacity |
| Tab's Review Dashboard | **Mode A** | Tab uses it daily — should feel like home. Cream + charcoal + yellow status indicators. |
| Post-acceptance "Final files" email | **Mode A** | Celebratory yellow accent on "It's yours" headline |
| Premium upgrade email (+$1,000) | **Mode A with Bold Coral CTA** | Cream + yellow body + coral on "Upgrade" button |
| Investor deck | **Mode B** | Indigo + cream + sparing yellow |
| Press kit (PDF) | **Mode B** | Same |
| Social media posts (BB marketing) | **Mode A** | Match IEI 2026 social content style |
| Brand Blueprint own logo + brand kit (the meta — BB's own playbook if ever needed) | **Mode A + Mode B alternating** | Like a brand kit Tab would deliver to a customer |

---

## 🚫 Don't-do list

These break the brand. The AI's taste rules + Buzzy + Henrique enforce these.

- ❌ Gradients of any kind (blue→purple, sunset gradients, etc.) — single solid colors only
- ❌ Glowing AI-node imagery or circuit-board graphics
- ❌ Robot emojis or AI clichés (no 🤖)
- ❌ Emojis ANYWHERE in product UI (acceptable in casual social posts only)
- ❌ Drop shadows on cards/photos — flat layering only
- ❌ "AI-powered" badges or "Powered by GPT/Claude" attribution
- ❌ Purple anywhere unless extremely intentional
- ❌ Teal/cyan unless extremely intentional
- ❌ Generic startup stock photography
- ❌ AI-generated imagery
- ❌ Cursive/script ANYWHERE except for handwritten Tab signature sign-off moments
- ❌ Tech-startup gradient blue (this is the #1 sterile-AI default — actively avoid)
- ❌ Pastel-girlboss palette (blush, sage, dusty-rose)

---

## 🛠 Implementation guidance for Buzzy

### CSS Variable structure (recommended)

```css
:root {
  /* Primary palette */
  --color-cream: #FAF6EF;
  --color-cream-light: #FDFBF6;
  --color-charcoal: #1A1A1A;
  --color-charcoal-muted: #4A4A4A;
  --color-iei-yellow: #FFD400;
  --color-bold-coral: #E94F37;
  --color-deep-indigo: #1B2A4E;

  /* Support */
  --color-soft-gray: #E5E0D5;
  --color-success: #2E7D32;
  --color-warning: #F57C00;
  --color-error: #C62828;

  /* Typography */
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-weight-display: 900;
  --font-weight-bold: 700;
  --font-weight-medium: 500;
  --font-weight-regular: 400;

  /* Spacing scale (4px base) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --space-12: 48px;
  --space-16: 64px;
  --space-24: 96px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;
}
```

### Recommended Tailwind class patterns

| Pattern | Class |
|---|---|
| Mode A page bg | `bg-cream text-charcoal` |
| Mode B page bg | `bg-deep-indigo text-cream` |
| Display headline | `text-5xl md:text-7xl font-black tracking-tight leading-none` |
| Body | `text-base md:text-lg leading-relaxed text-charcoal` |
| Primary CTA | `bg-bold-coral text-cream font-semibold px-8 py-4 rounded-pill hover:bg-charcoal transition` |
| Secondary CTA | `bg-iei-yellow text-charcoal font-semibold px-8 py-4 rounded-pill hover:bg-charcoal hover:text-cream transition` |
| Card | `bg-cream-light rounded-lg p-6 border border-soft-gray` |
| Yellow highlighter (inline) | `bg-iei-yellow px-2 py-0.5` (apply to span around 1-3 word phrases) |
| Yellow brushstroke underline | Custom SVG asset Buzzy creates once, used as `background-image` |

---

## 🎯 Open questions for v2 (NOT MVP — capture for later)

- [ ] Custom logo design ($300-$800 freelance) — the B-as-bulb integrated mark
- [ ] Söhne typography upgrade (~$500 font license)
- [ ] Dark mode for customer dashboard
- [ ] Branded illustration system (decorative element library beyond brush-strokes + chevrons)
- [ ] Animated transitions for chat UI (Framer-vibe motion)
- [ ] Photography commissioning for hero shots (Tab + community + studio)
- [ ] Sound design (subtle clicks for "Lock It In" moments, walkthrough checkmarks)

---

**Owner:** Tab (final approval)
**Implements:** Buzzy (FE), Henrique (BE email templates + watermark), Tab (content)
**Related:** `VISUAL_REFERENCES.md` (catalog + AI taste rules) · `BRAND_VOICE_SPEC.md` (voice rules) · `chat-intake-questions.md` (UX spec)
**Last updated:** 2026-05-21
