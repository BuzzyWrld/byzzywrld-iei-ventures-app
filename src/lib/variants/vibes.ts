/**
 * Vibe profiles — the aesthetic-direction system for landing-page variants.
 *
 * Purpose:
 *   Each brand kit ships THREE complete 3-page websites (home/about/flex), each
 *   in a different VIBE. All three vibes use the same underlying brand kit
 *   (same colors, same voice, same positioning) but apply distinctly different
 *   typography, color emphasis, and layout signatures so the customer sees three
 *   genuinely different aesthetic interpretations and picks the one that lands.
 *
 * Why this exists:
 *   Before this module, landing.ts produced a SINGLE 3-page website using the
 *   default WONE-style design system. Three pages, one vibe. Customer never got
 *   to compare aesthetic directions. Now: 3 vibes × 3 pages = 9 outputs,
 *   organized as 3 cohesive websites. The vibe deterministically locks fonts +
 *   color strategy + layout flavor — so the LLM can render all 3 pages of a
 *   vibe in parallel and they still cohere (same fonts, same palette role,
 *   same layout register).
 *
 * Source material:
 *   The 5 base vibes map 1:1 to Tab's FIVE FLAVORS in design-anatomy.md
 *   (Editorial Density / Type-as-Art / Vintage Diaspora Poster /
 *    Pattern-as-Branding / Cinematic Street Pop Art). Each vibe pulls its
 *   typography + decorative-move language from a specific Section A or B
 *   card in that doc — so generated pages match Tab's verified taste.
 *
 * Adding a vibe:
 *   Append to VIBES below. Update pickVibes() if the new vibe needs to be
 *   biased toward a specific archetype or industry. No callsite changes
 *   needed — landing.ts iterates VIBES via pickVibes().
 */

import type { BrandForVariants, IntakeContext } from "./shared";

export type Vibe = {
  /** url-safe slug — becomes the subdirectory under landing-variants/ and the manifest key */
  slug: string;
  /** human-readable label shown to the customer in the picker UI */
  name: string;
  /** which of Tab's 5 design-anatomy flavors this vibe is anchored to */
  flavor:
    | "editorial-density"
    | "type-as-art"
    | "vintage-diaspora-poster"
    | "pattern-as-branding"
    | "cinematic-street-pop-art";
  /** one-line aesthetic description for the manifest rationale */
  tagline: string;

  // ---- Typography (locked per vibe so all 3 pages of a vibe match) ----
  /** Google Fonts family name — used for H1/H2/display */
  displayFont: string;
  /** Google Fonts family name — used for body copy */
  bodyFont: string;
  /** Optional accent font (script/mono) — used for kickers, numerals, or pull-quotes */
  accentFont?: string;
  /** Suggested H1 weight (e.g. "900" for Anton, "700" for Fraunces) */
  displayWeight: string;

  // ---- Color strategy (operates on the brand's existing palette) ----
  /** Which brand role becomes the page surface (background) for this vibe */
  surfaceRole: "neutral-light" | "neutral-dark" | "primary" | "secondary";
  /** Which brand role becomes the lead accent (CTAs, emphasis) for this vibe */
  accentRole: "primary" | "secondary" | "accent";
  /** Overall contrast register */
  contrast: "high" | "medium" | "warm-muted";
  /** Mood word for the LLM to internalize */
  surfaceMood: string;

  // ---- Layout + decorative signature ----
  /** 1-2 sentence layout directive that the LLM should execute across all 3 pages */
  layoutSignature: string;
  /** The ONE recurring decorative move that ties the 3 pages together */
  decorativeMove: string;
  /** Optional CSS-pattern recipe (only for pattern-as-branding) */
  cssPattern?: string;

  // ---- Voice & rhythm hints ----
  /** Copy density per section */
  copyDensity: "sparse" | "balanced" | "dense";
  /** Tab-voice descriptor (verbatim from iei-voice-rules.md) the LLM should channel */
  voiceCue: string;

  // ---- The card from design-anatomy.md the LLM should pattern-match ----
  /** Short distillation of the relevant design-anatomy card — injected verbatim into the prompt */
  anatomyCard: string;
};

/* ---------------------------------------------------------------------------
 * The 5 base vibes
 * ------------------------------------------------------------------------- */

const EDITORIAL_DENSITY: Vibe = {
  slug: "editorial-density",
  name: "Editorial Density",
  flavor: "editorial-density",
  tagline:
    "Magazine-grade information density. Serif display, generous side-bars, numbered tenets.",
  displayFont: "Fraunces",
  bodyFont: "Cabinet Grotesk",
  accentFont: "JetBrains Mono",
  displayWeight: "700",
  surfaceRole: "neutral-light",
  accentRole: "accent",
  contrast: "high",
  surfaceMood: "Cream-and-charcoal magazine spread — refined, not minimal",
  layoutSignature:
    "Editorial 12-col grid. Headlines anchor upper-left, supporting sidebars run flush-right, body copy in 60-72ch columns with hanging quotes. Numbered tenets (01 / 02 / 03) replace card grids.",
  decorativeMove:
    "Color-coded thin date-strips and fine-rule dividers between sections. Serif drop-caps on long-form paragraphs. Monospace kickers (10-12px, letter-spacing 0.14em) labeling every section.",
  copyDensity: "dense",
  voiceCue: "real flow, real groovy",
  anatomyCard: [
    "Anchored to B3 (Gut Experience / kabinua) + B8 (Jasmin Manning Calendar) from design-anatomy.md:",
    "  - Editorial density done elegantly — info-rich without ever feeling crowded.",
    "  - Serif headline with optional script callout for emotional shift.",
    "  - 5-column results matrix or color-coded date strips as visual rhythm device.",
    "  - Split-frame layout (identity left, schedule right) when scheduling info exists.",
    "  - Real-element clip art via CSS shapes (no stock imagery).",
  ].join("\n"),
};

const TYPE_AS_ART: Vibe = {
  slug: "type-as-art",
  name: "Type as Art",
  flavor: "type-as-art",
  tagline:
    "The wordmark IS the design. Massive condensed display, stacked stanzas, vertical type tabs.",
  displayFont: "Anton",
  bodyFont: "Geist",
  accentFont: "Geist Mono",
  displayWeight: "400",
  surfaceRole: "neutral-dark",
  accentRole: "primary",
  contrast: "high",
  surfaceMood: "Boom-in-your-face — high-contrast, single brand color carries the weight",
  layoutSignature:
    "Massive display type fills the upper 60% of every hero (clamp 96-160px). Stacked one-word-per-line headlines. Asymmetric placement — never centered. Vertical text tabs on side-rails carry secondary info.",
  decorativeMove:
    "Outline-fill display letters (transparent fill, 1.5px stroke in accent color) used on at least one section title per page. Gigantic numerals (clamp 120-200px) where any count exists. Side-rail vertical type with letter-spacing 0.3em.",
  copyDensity: "sparse",
  voiceCue: "boom in your face",
  anatomyCard: [
    "Anchored to B1 (Artscape 2026), B7 (ROOT WORD), B9 (PACK LIGHT) from design-anatomy.md:",
    "  - Each letter or stanza is its own art object — type IS the design.",
    "  - HUGE outline-fill display (one word per line, stacked, fills frame).",
    "  - Type IN FRONT of cutout silhouette / shape — depth layers via z-index.",
    "  - Vertical-tab type on side-rails for event info or secondary copy.",
    "  - Hypnotic = mathematical rhythm + variation per element.",
  ].join("\n"),
};

const VINTAGE_DIASPORA_POSTER: Vibe = {
  slug: "vintage-diaspora-poster",
  name: "Vintage Diaspora Poster",
  flavor: "vintage-diaspora-poster",
  tagline:
    "Warm earth palette, script alongside chunky display, sunburst and pattern accents.",
  displayFont: "Fraunces",
  bodyFont: "Source Serif 4",
  accentFont: "Caveat",
  displayWeight: "900",
  surfaceRole: "neutral-light",
  accentRole: "secondary",
  contrast: "warm-muted",
  surfaceMood: "Warm cream surface, brick-mustard-olive accents — heritage celebration register",
  layoutSignature:
    "Poster-style centered title (large, hand-set feel) over a textured cream surface. Italic descriptor lists running along the bottom edge. Zig-zag two-column narrative on About — script callouts overlap chunky display.",
  decorativeMove:
    "Sunburst / star / zebra-stripe CSS patterns at corners as celebration motifs. Script (Caveat) for one short callout per page — never used for long copy. Vintage banner ribbon shapes containing event names. Italic descriptor list ('NATIVES GEM · INTENTIONAL ART · OXTAIL') above footer.",
  copyDensity: "balanced",
  voiceCue: "let's go, everybody's gathering",
  anatomyCard: [
    "Anchored to B6 (BLK ASS Backyard Birthday Bashment) + B11 (Spirit World / Royal Blue) from design-anatomy.md:",
    "  - Mustard/brick/olive heritage palette with cream surface.",
    "  - Sunburst, star, or zebra-stripe pattern accents at corners.",
    "  - Italic descriptor lists as bottom decorative band.",
    "  - Script callout (1-3 words) layered over chunky display headline.",
    "  - Vintage banner ribbon shapes for emphasis.",
    "  - Unexpected image/content crossover OK — surprise creates memorability.",
  ].join("\n"),
};

const PATTERN_AS_BRANDING: Vibe = {
  slug: "pattern-as-branding",
  name: "Pattern as Branding",
  flavor: "pattern-as-branding",
  tagline:
    "One signature recurring pattern. Restrained typography. Pattern carries all the visual weight.",
  displayFont: "General Sans",
  bodyFont: "IBM Plex Sans",
  accentFont: "IBM Plex Mono",
  displayWeight: "600",
  surfaceRole: "neutral-light",
  accentRole: "primary",
  contrast: "medium",
  surfaceMood: "Restrained gallery feel — the pattern is the brand, everything else is whitespace",
  layoutSignature:
    "Spacious grid (max-width 1200px). One CSS pattern band running across each section's background — at 8-12% opacity behind type. Type is sober and disciplined; pattern alone carries the personality.",
  decorativeMove:
    "Pick ONE signature pattern at brand-build time and use it everywhere: pixel-dissolve / dotted-grid / honeycomb / wavy-lines / micro-stripes. Pattern appears in: hero backdrop, section dividers, footer band. Never two patterns. Never a pattern in the brand's accent color (pattern is always in neutral at low opacity).",
  cssPattern:
    "Default pattern recipe: micro-dot grid via radial-gradient(circle, currentColor 1px, transparent 1px) with background-size: 12px 12px and opacity 0.08. Override with pixel-dissolve, honeycomb, or stripes if industry/archetype warrants.",
  copyDensity: "balanced",
  voiceCue: "we got our shit together",
  anatomyCard: [
    "Anchored to B10 (Honey Dijon / Kotic Couture) from design-anatomy.md:",
    "  - Distinctive recurring TEXTURE/PATTERN becomes the brand visual signature.",
    "  - Restraint matters — pattern is the ONLY decoration; type does the rest.",
    "  - Pattern at low opacity (~8-12%) so it never competes with content.",
    "  - One pattern, used consistently across all surfaces — never multiple.",
  ].join("\n"),
};

const CINEMATIC_STREET_POP_ART: Vibe = {
  slug: "cinematic-street-pop-art",
  name: "Cinematic Street Pop Art",
  flavor: "cinematic-street-pop-art",
  tagline:
    "Saturated brand color popping against neutral backdrops, oversized quote marks as graphics.",
  displayFont: "Manrope",
  bodyFont: "Geist",
  accentFont: "JetBrains Mono",
  displayWeight: "800",
  surfaceRole: "neutral-dark",
  accentRole: "accent",
  contrast: "high",
  surfaceMood: "Cinematic street pop art — saturated accent against deep neutral, organic shape backdrop",
  layoutSignature:
    "Two-panel split (60/40) on heroes — large quote or claim left, organic-shape backdrop right. CSS-drawn organic blob shapes (border-radius irregular) tinted in the accent color sit behind featured copy. Diagonal cuts divide zones.",
  decorativeMove:
    "Oversized opening quote marks (clamp 120-220px) in the accent color as graphic anchors, not punctuation — they live AT THE TOP of pull-quotes, not next to them. CSS organic blob shapes (border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%) as backdrop accents. Diagonal section dividers (clip-path: polygon).",
  copyDensity: "balanced",
  voiceCue: "dope ass realness",
  anatomyCard: [
    "Anchored to A2 (BLK BTR FLY James Brown) + A4 (Smalltimore Homes 'Everyone Deserves A Home') from design-anatomy.md:",
    "  - Oversized quote marks sized as graphic art (1-2 line-height tall, not punctuation).",
    "  - Saturated brand color popping against a B&W or neutral backdrop.",
    "  - Organic CSS blob shapes behind featured content (gradients + irregular border-radius).",
    "  - Diagonal section dividers via clip-path.",
    "  - Quote IS the lead actor — background feels like it could move even when static.",
  ].join("\n"),
};

const VIBES: ReadonlyArray<Vibe> = [
  EDITORIAL_DENSITY,
  TYPE_AS_ART,
  VINTAGE_DIASPORA_POSTER,
  PATTERN_AS_BRANDING,
  CINEMATIC_STREET_POP_ART,
];

/* ---------------------------------------------------------------------------
 * Selection logic
 * ------------------------------------------------------------------------- */

type IndustryBias = readonly Vibe["slug"][];

/**
 * Industry → ordered preference for the 3 vibes to ship. The FIRST 3 entries
 * of each list are the picked vibes. Lists are ordered by best-fit-first, with
 * the 4th and 5th as deterministic fallbacks if a future change disables one.
 */
const INDUSTRY_BIAS: Record<string, IndustryBias> = {
  // Tech / SaaS / B2B → sober type-art-led trio
  saas: ["type-as-art", "editorial-density", "pattern-as-branding", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  tech: ["type-as-art", "editorial-density", "pattern-as-branding", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  software: ["type-as-art", "editorial-density", "pattern-as-branding", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  fintech: ["editorial-density", "type-as-art", "pattern-as-branding", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  finance: ["editorial-density", "type-as-art", "pattern-as-branding", "cinematic-street-pop-art", "vintage-diaspora-poster"],

  // Creative agencies / studios → all three poster-leaning, distinct
  agency: ["type-as-art", "cinematic-street-pop-art", "editorial-density", "vintage-diaspora-poster", "pattern-as-branding"],
  studio: ["type-as-art", "cinematic-street-pop-art", "editorial-density", "vintage-diaspora-poster", "pattern-as-branding"],
  design: ["type-as-art", "cinematic-street-pop-art", "editorial-density", "vintage-diaspora-poster", "pattern-as-branding"],

  // E-commerce / consumer goods → editorial + vintage + cinematic
  ecommerce: ["editorial-density", "vintage-diaspora-poster", "cinematic-street-pop-art", "type-as-art", "pattern-as-branding"],
  retail: ["editorial-density", "vintage-diaspora-poster", "cinematic-street-pop-art", "type-as-art", "pattern-as-branding"],
  apparel: ["type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster", "editorial-density", "pattern-as-branding"],
  streetwear: ["type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster", "editorial-density", "pattern-as-branding"],

  // Wellness / health / lifestyle → editorial + vintage + cinematic
  wellness: ["editorial-density", "vintage-diaspora-poster", "cinematic-street-pop-art", "pattern-as-branding", "type-as-art"],
  health: ["editorial-density", "vintage-diaspora-poster", "cinematic-street-pop-art", "pattern-as-branding", "type-as-art"],
  beauty: ["editorial-density", "vintage-diaspora-poster", "cinematic-street-pop-art", "type-as-art", "pattern-as-branding"],

  // Food & bev / hospitality → vintage + cinematic + editorial
  food: ["vintage-diaspora-poster", "cinematic-street-pop-art", "editorial-density", "type-as-art", "pattern-as-branding"],
  beverage: ["vintage-diaspora-poster", "cinematic-street-pop-art", "editorial-density", "type-as-art", "pattern-as-branding"],
  hospitality: ["vintage-diaspora-poster", "editorial-density", "cinematic-street-pop-art", "type-as-art", "pattern-as-branding"],
  restaurant: ["vintage-diaspora-poster", "editorial-density", "cinematic-street-pop-art", "type-as-art", "pattern-as-branding"],

  // Education / media / publishing → editorial-leaning
  education: ["editorial-density", "type-as-art", "cinematic-street-pop-art", "pattern-as-branding", "vintage-diaspora-poster"],
  media: ["editorial-density", "type-as-art", "cinematic-street-pop-art", "pattern-as-branding", "vintage-diaspora-poster"],
  publishing: ["editorial-density", "type-as-art", "vintage-diaspora-poster", "cinematic-street-pop-art", "pattern-as-branding"],

  // Real estate / professional services → editorial + pattern + type-art
  "real-estate": ["editorial-density", "pattern-as-branding", "type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  realestate: ["editorial-density", "pattern-as-branding", "type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  "professional-services": ["editorial-density", "pattern-as-branding", "type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster"],
  consulting: ["editorial-density", "pattern-as-branding", "type-as-art", "cinematic-street-pop-art", "vintage-diaspora-poster"],

  // Default — coherent diverse spread
  default: ["editorial-density", "type-as-art", "cinematic-street-pop-art", "pattern-as-branding", "vintage-diaspora-poster"],
};

/** Archetype → vibe nudge. If the archetype matches, bias the first slot. */
const ARCHETYPE_BIAS: Record<string, Vibe["slug"]> = {
  hero: "type-as-art",
  outlaw: "type-as-art",
  rebel: "type-as-art",
  sage: "editorial-density",
  ruler: "editorial-density",
  caregiver: "vintage-diaspora-poster",
  lover: "vintage-diaspora-poster",
  everyman: "vintage-diaspora-poster",
  creator: "cinematic-street-pop-art",
  jester: "cinematic-street-pop-art",
  explorer: "pattern-as-branding",
  innocent: "pattern-as-branding",
  magician: "cinematic-street-pop-art",
};

function normalizeKey(s: string | undefined): string {
  return (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findIndustryBias(intake?: IntakeContext): IndustryBias {
  if (!intake) return INDUSTRY_BIAS.default;
  const haystack = [
    intake.industry,
    intake.productDescription,
    intake.notes,
    intake.targetAudience,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase())
    .join(" ");

  // Direct industry key match first (Q2 selection)
  const norm = normalizeKey(intake.industry);
  for (const key of Object.keys(INDUSTRY_BIAS)) {
    if (norm === normalizeKey(key)) return INDUSTRY_BIAS[key];
  }
  // Keyword sweep through the broader brief
  if (/\b(saas|software|api|developer|platform)\b/.test(haystack)) return INDUSTRY_BIAS.saas;
  if (/\b(tech|engineer|cloud|devtool|ai|ml)\b/.test(haystack)) return INDUSTRY_BIAS.tech;
  if (/\b(fintech|finance|bank|invest|crypto)\b/.test(haystack)) return INDUSTRY_BIAS.fintech;
  if (/\b(agenc|studio|creative|design|brand)\b/.test(haystack)) return INDUSTRY_BIAS.agency;
  if (/\b(streetwear|fashion|apparel|merch)\b/.test(haystack)) return INDUSTRY_BIAS.streetwear;
  if (/\b(ecommerce|e-commerce|shop|retail|store|catalog)\b/.test(haystack)) return INDUSTRY_BIAS.ecommerce;
  if (/\b(wellness|health|fitness|holistic|therap|coach)\b/.test(haystack)) return INDUSTRY_BIAS.wellness;
  if (/\b(beauty|cosmetic|skincare|fragrance|candle)\b/.test(haystack)) return INDUSTRY_BIAS.beauty;
  if (/\b(food|restaurant|cafe|bakery|kitchen|chef)\b/.test(haystack)) return INDUSTRY_BIAS.food;
  if (/\b(beverage|drink|wine|coffee|tea|spirit)\b/.test(haystack)) return INDUSTRY_BIAS.beverage;
  if (/\b(hotel|hospitality|venue|resort|airbnb)\b/.test(haystack)) return INDUSTRY_BIAS.hospitality;
  if (/\b(school|course|cohort|education|teach|tutor)\b/.test(haystack)) return INDUSTRY_BIAS.education;
  if (/\b(media|podcast|publisher|newsletter|magazine)\b/.test(haystack)) return INDUSTRY_BIAS.media;
  if (/\b(real estate|realtor|property|broker)\b/.test(haystack)) return INDUSTRY_BIAS["real-estate"];
  if (/\b(consult|advisor|professional service|firm|law)\b/.test(haystack)) return INDUSTRY_BIAS.consulting;
  return INDUSTRY_BIAS.default;
}

/**
 * Pick the THREE vibes to ship for this brand. Deterministic given the same
 * intake — no LLM call, no randomness — so reruns produce the same trio.
 *
 *  1. Start from the industry's ordered preference list (5 entries).
 *  2. If archetype matches an ARCHETYPE_BIAS, promote that slug to the front.
 *  3. Take the first 3 distinct slugs.
 *  4. Map back to Vibe objects.
 */
export function pickVibes(
  _brand: BrandForVariants,
  intake?: IntakeContext
): [Vibe, Vibe, Vibe] {
  const industryOrder = [...findIndustryBias(intake)];

  // Archetype nudge — move the matched vibe to slot 0 if present
  const archeKey = normalizeKey(intake?.archetype);
  if (archeKey && ARCHETYPE_BIAS[archeKey]) {
    const promoted = ARCHETYPE_BIAS[archeKey];
    const idx = industryOrder.indexOf(promoted);
    if (idx > 0) {
      industryOrder.splice(idx, 1);
      industryOrder.unshift(promoted);
    }
  }

  // De-dupe and take 3
  const picked: Vibe["slug"][] = [];
  for (const slug of industryOrder) {
    if (picked.length >= 3) break;
    if (!picked.includes(slug)) picked.push(slug);
  }
  // Defensive fallback — should never trigger because all lists have 5 entries
  while (picked.length < 3) {
    for (const v of VIBES) {
      if (picked.length >= 3) break;
      if (!picked.includes(v.slug)) picked.push(v.slug);
    }
  }

  const lookup = new Map(VIBES.map((v) => [v.slug, v]));
  const [a, b, c] = picked.map((slug) => lookup.get(slug)!);
  return [a, b, c];
}

/**
 * Render the vibe profile as a prompt block to inject into the LLM system prompt.
 * Locks fonts, color strategy, layout signature, and decorative move so all 3 pages
 * of this vibe render consistently — and so the 3 vibes look distinct from each other.
 */
export function vibePromptBlock(vibe: Vibe): string {
  return [
    "",
    "--- VIBE PROFILE FOR THIS WEBSITE (locked — all 3 pages share these) ---",
    `Vibe name: ${vibe.name}`,
    `Aesthetic family: ${vibe.flavor}`,
    `Surface mood: ${vibe.surfaceMood}`,
    "",
    "TYPOGRAPHY (use exactly these Google Fonts — link via <link> in <head>):",
    `  - Display / headings: "${vibe.displayFont}" (weight ${vibe.displayWeight})`,
    `  - Body copy: "${vibe.bodyFont}"`,
    vibe.accentFont ? `  - Accent (kickers / mono / script): "${vibe.accentFont}"` : "",
    "  - Use fluid clamp() sizing for display: clamp(2.5rem, 5vw + 1rem, 5.5rem) on H1.",
    "  - Tight tracking on display (letter-spacing -0.02em). Body line-height 1.55-1.7.",
    "",
    "COLOR ROLES (operate on the brand's existing palette from the brand brief below):",
    `  - Surface (page background): use the brand's ${vibe.surfaceRole} color`,
    `  - Lead accent (CTAs, emphasis, key callouts): use the brand's ${vibe.accentRole} color`,
    `  - Contrast register: ${vibe.contrast}`,
    `  - Never use the accent color for body text, borders, or large backgrounds — only for emphasis moments.`,
    "",
    "LAYOUT SIGNATURE (the visual rhythm that ties the 3 pages together):",
    `  ${vibe.layoutSignature}`,
    "",
    "DECORATIVE MOVE (the single recurring move — appears on every page of this vibe):",
    `  ${vibe.decorativeMove}`,
    vibe.cssPattern ? `\nCSS PATTERN RECIPE:\n  ${vibe.cssPattern}` : "",
    "",
    "COPY DENSITY:",
    `  ${vibe.copyDensity} (sparse = whitespace dominates · balanced = mixed · dense = magazine-grade)`,
    "",
    "VOICE CUE (Tab vocabulary — channel this energy in headlines and CTAs):",
    `  "${vibe.voiceCue}"`,
    "",
    "TAB DESIGN ANATOMY REFERENCE (study these moves):",
    vibe.anatomyCard,
    "--- END VIBE PROFILE ---",
    "",
  ]
    .filter((l) => l !== "")
    .join("\n");
}
