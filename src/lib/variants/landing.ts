/**
 * Website deliverable — THREE complete 3-page websites in distinct vibes.
 *
 * Per Henrique's 2026-05-26 spec (overrides Tab's 2026-05-21 "one 3-page
 * website" decision — see DECISIONS_LOG.md): each customer's brand kit ships
 * with THREE website versions. Each version is a complete site with:
 *
 *   1. Home   — hero + positioning + offerings preview + CTA
 *   2. About  — brand story (Origin · Why · Struggle · Turning Point) + values
 *   3. Flex   — services / products / events / booking / mixed (picked from
 *                the customer's intake — see pickFlexPage)
 *
 * ALL THREE PAGES OF A VERSION SHARE ONE VIBE:
 *   - Same fonts (display + body + accent)
 *   - Same color strategy (which brand role becomes surface, which becomes accent)
 *   - Same layout signature + decorative move
 *
 * THE THREE VERSIONS ARE DELIBERATELY DIFFERENT FROM EACH OTHER:
 *   - Vibes picked deterministically by industry + archetype via pickVibes()
 *   - Each vibe maps to one of Tab's FIVE FLAVORS in design-anatomy.md
 *
 * Output structure:
 *   landing-variants/
 *     <vibe-slug>/
 *       home.html
 *       about.html
 *       <flex-type>.html        (services / products / events / booking / mixed)
 *
 * Manifest items returned from this function = 3 (one per vibe). Each item's
 * `filename` points at that vibe's home page; `pages[]` lists the about and
 * flex pages so skill.ts can publish them too (they're reachable via the
 * home's nav).
 *
 * The 9 LLM calls fan out in parallel. The vibe profile locks fonts + color
 * roles + layout signature so all 3 pages of a vibe cohere despite being
 * generated independently. The exemplar (FamFit HTML, ~48KB) is only loaded
 * into the home-page call of each vibe to keep token cost under control —
 * about/flex pages inherit visual decisions from their vibe profile alone.
 */
import fs from "node:fs/promises";
import path from "node:path";
import {
  brandBrief,
  callClaude,
  parseJson,
  safeSlug,
  type BrandForVariants,
  type IntakeContext,
} from "./shared";
import { landingExemplar } from "./exemplar";
import { pickIndustry, industryDirectionBlock } from "@/lib/industries";
import { pickVibes, vibePromptBlock, type Vibe } from "./vibes";

export type LandingVariantPage = {
  /** "home" | "about" | "<flex-type>" */
  key: string;
  /** Display title for the page (e.g. "Home", "About", "Services") */
  title: string;
  /** Path under outputDir — used by skill.ts to publish each file */
  filename: string;
};

export type LandingVariant = {
  /** Vibe slug — e.g. "editorial-density". URL-safe; doubles as the subfolder. */
  key: string;
  /** Vibe name shown in the picker UI — e.g. "Editorial Density" */
  title: string;
  /** One-line rationale shown under the preview card */
  rationale: string;
  /** Home-page filename — what the FE manifest points at and previews */
  filename: string;
  /** About + flex pages — published alongside the home so its nav links resolve */
  pages: LandingVariantPage[];
};

type FlexType = "services" | "products" | "events" | "booking" | "mixed";

const FLEX_TYPES: ReadonlySet<FlexType> = new Set([
  "services",
  "products",
  "events",
  "booking",
  "mixed",
]);

type PageKey = "home" | "about" | FlexType;

type PageSpec = {
  key: PageKey;
  title: string;
  description: string;
};

/**
 * Pick the Flex page type for the customer's website.
 *
 * Order of precedence (per Tab's 2026-05-21 spec):
 *   1. `intake.flexPageType` — the customer's explicit Q24b answer.
 *   2. Keyword inference from offerings + audience signals.
 *   3. Default to "mixed" (per Tab: "Defaults to mixed if skipped").
 */
function pickFlexPage(intake?: IntakeContext): FlexType {
  const explicit = (intake?.flexPageType ?? "").trim().toLowerCase();
  if (FLEX_TYPES.has(explicit as FlexType)) return explicit as FlexType;

  const blob = [
    intake?.industry,
    intake?.productDescription,
    intake?.notes,
    intake?.targetAudience,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\b(event|workshop|retreat|class|seminar|conference|meetup|gathering)\b/.test(blob)) {
    return "events";
  }
  if (/\b(product|merch|merchandise|apparel|shop|store|e-?commerce|catalog|sku)\b/.test(blob)) {
    return "products";
  }
  if (/\b(booking|book a call|calendly|consult|consultation|session|appointment)\b/.test(blob)) {
    return "booking";
  }
  return "mixed";
}

/** Page specs — Home + About + one Flex page picked from intake. */
function buildPageSpecs(flex: FlexType): PageSpec[] {
  const flexSpec: Record<FlexType, PageSpec> = {
    services: {
      key: "services",
      title: "Services",
      description:
        "Page listing what the brand offers as services. Each service: name, one-paragraph description, what it includes, and a per-service CTA (Book / Inquire). NOT a card grid of 3 equal items — use a numbered editorial list (01, 02, 03 in monospace numerals) or a 2-column zig-zag layout. End with one prominent 'Book a call' CTA. No card-shadow boxes.",
    },
    products: {
      key: "products",
      title: "Products",
      description:
        "Page showcasing the brand's products. Use a product gallery (3-up grid IS OK here because that's the e-commerce convention) with name, short description, price-or-CTA. Include an opening statement about the product line's philosophy above the grid. End with a single newsletter or 'Get notified about new drops' CTA. Treat the product page like a brand-led lookbook, not a generic Shopify template.",
    },
    events: {
      key: "events",
      title: "Events",
      description:
        "Page listing upcoming events / workshops / classes. Each event: date in large display type, event name, one-paragraph description, location, RSVP CTA. Use a vertical timeline or stacked editorial cards (NOT a 3-up grid). Above the list, one paragraph framing the WHY of the events. End with a 'Get notified about future events' CTA.",
    },
    booking: {
      key: "booking",
      title: "Book",
      description:
        "Page focused on getting the customer onto the brand's calendar. Hero is one short line about what the call delivers + a single primary CTA pointing to the (placeholder) booking URL. Below the hero: 3 short reasons-to-book (asymmetric layout, NOT 3 equal cards), one optional testimonial pull-quote, and a brief 'what to expect on the call' list (numbered 01-03 in monospace numerals). End with the booking CTA repeated. Leave a clearly-marked `{{BOOKING_URL}}` placeholder for the customer to swap in their Calendly / Cal.com / SavvyCal link.",
    },
    mixed: {
      key: "mixed",
      title: "Offerings",
      description:
        "Hybrid page that shows the brand's full mix: a 'Services' section, a 'Products' section (if applicable), an 'Upcoming' (events / drops) section, and a 'Book' section — each as its own clearly-titled vertical band stacked top-to-bottom. Each band uses an editorial layout (NOT a 3-up grid). Only include sections that fit the customer's actual offerings; omit any that don't. End with one final CTA that points to whichever offering type seems most central from the brand brief. Leave a `{{BOOKING_URL}}` placeholder anywhere a calendar link belongs.",
    },
  };
  return [
    {
      key: "home",
      title: "Home",
      description:
        "Opening home page of the brand's 3-page website. ASYMMETRIC hero — NOT center-stacked. Big H1 offset left (or right), single CTA pinned to the opposite side or below at an offset. Use CSS Grid (no flex-math). One concise positioning section + an offerings preview (link to services/products/events page) + single primary CTA. Use --ease-out cubic-bezier for the CTA's :active scale(0.97). Feels product-led, confident, not vanilla. Center-stacked heroes are forbidden — the layout MUST visibly differ from a default templated hero.",
    },
    {
      key: "about",
      title: "About",
      description:
        "About page — the brand's story told in editorial / magazine style. Opening pull-quote (the brand's positioning or signature phrase) in large display type. Then narrative sections drawn from the customer's answers: Origin → Why → Struggle → Turning Point → Who You Serve. Two-column zig-zag layout (NOT 3 equal cards). End with values listed as numbered tenets (01, 02, 03 in monospace numerals) and a single 'Work with us' or 'Get in touch' CTA. No founder-photo placeholder — use typographic emphasis instead.",
    },
    flexSpec[flex],
  ];
}

/**
 * Anti-AI-slop overlay applied to every page regardless of vibe.
 * Stripped from the larger WONE_STYLE_DIRECTIVES — kept only the rules that
 * are universal (no Inter, no AI purple, no centered hero, asymmetry, motion
 * easing, prefers-reduced-motion). The Wone-SaaS specific rules (card grids,
 * Stripe-Atlas look) are NOT injected here because each vibe specifies its
 * own layout signature.
 */
const ANTI_SLOP_RULES = `

UNIVERSAL ANTI-AI-SLOP RULES (apply ON TOP OF the vibe profile above — these never bend):

Typography:
  - NEVER use Inter as a font, not even as fallback. Inter is the #1 AI-design tell.
  - The display + body + accent fonts are LOCKED in the vibe profile above. Use those exactly.
  - Use clamp() for fluid display sizing.
  - Tight tracking on display (letter-spacing -0.02em). Body line-height 1.55-1.7.

Color (interpreted through the vibe's surfaceRole + accentRole roles):
  - The AI-purple / blue-violet gradient look is BANNED. No purple glows. No neon.
  - Pure black #000000 is BANNED — use #0c0c0c or darker neutral.
  - Saturation cap: keep accent colors under ~80% saturation.
  - At most ONE accent color used for emphasis per page. Borders are neutral.
  - No gradient text on headings (background-clip: text). 2021-era AI tell.

Layout:
  - Centered hero with 3 stacked CTAs is BANNED. Prefer asymmetric or split-screen.
  - 3-equal-column "feature card" grids for services/values are BANNED unless this is the products page on an e-commerce brand.
  - max-width: 1400px (or 1200px). Use CSS Grid for any 2D layout — never flex-percentage math.
  - Mobile-first; collapse to single column under 768px.

Interaction:
  - Define these easing variables in :root and use them everywhere:
      --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
      --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  - Primary CTAs MUST have transform: scale(0.97) on :active and a 160ms ease-out transition.
  - Hover effects MUST be gated by @media (hover: hover) and (pointer: fine).
  - prefers-reduced-motion media query MUST be present and respected.
  - Animate only transform + opacity. Never width/height/top/left/margin.
  - min-height: 100dvh on hero sections (not 100vh — vh breaks on mobile Safari).

Anti-AI-tells (presence of any of these = regenerate):
  - Emoji anywhere (already banned, restated for emphasis).
  - Neon outer glows on text/buttons/borders.
  - Gradient text on H1.
  - Heavy box-shadows (offset > 0 0 20px) — a 1px border carries the load instead.
  - Custom mouse cursors.
  - Stock-photo placeholder URLs.
  - Generic placeholder names ("John Doe", "Jane Smith").
  - Fake round numbers (10,000+ users) if no real intake source exists.
`;

/**
 * Tab-voice rules distilled from iei-voice-rules.md. Injected into every page
 * prompt so generated copy actually sounds like Tab's voice (not generic AI).
 */
const VOICE_RULES = `

TAB VOICE RULES (read every word — these are non-negotiable for all copy on this page):

1. Sound like Tab, not like an AI brand tool. Conversational. Short + long sentence mix.
   Contractions, fragments, asides. First-person when appropriate.

2. Use these proprietary phrases verbatim where they fit naturally — NEVER paraphrase:
   "Ideas Equal Income" · "From Idea to Income" · "Long live the light bulb moments" ·
   "Lock It In" · "Push past the first obvious answer" · "The answer is already inside you" ·
   "Long math first — raw truth before polish" · "Brand Ethos" (broader than identity).

3. BANNED — if any of these appear, the output is broken and must be regenerated:
   comprehensive, robust, leverage, delve, showcase, foster, transformative, holistic,
   dynamic, scalable (as modifier), seamless, ecosystem, tapestry, paradigm, synergy,
   "in today's fast-paced world", "at the intersection of", "where X meets Y",
   "unlock the potential", "navigate the complexities", any emoji.

4. Every important paragraph should CONFRONT a truth AND COMFORT the customer in the same breath.
   Not one or the other. Both, woven.

5. When describing people/audiences: cultural touchstones, not demographic labels.
   "Founders who came up on Living Single" > "millennial Black women 28-42".

6. Word preferences: Founder/Entrepreneur > business owner. Investment > purchase.
   Tribe / ideal client / your people > target audience (clinical).

7. Avoid "side hustle" (for serious founders), "boss babe", "girl boss", "manifest your dreams"
   (use "make your idea tangible" instead).
`;

/**
 * Ship-quality bar (Tier 1 Basic, $997). Distilled from tier-review-checklists.md
 * so the model self-checks before emitting.
 */
const SHIP_QUALITY_BAR = `

SHIP-QUALITY BAR (verify BEFORE emitting — fix any failures by regenerating that section):

- [ ] Hero headline uses the customer's positioning verbatim where possible (not paraphrased).
- [ ] Primary CTA matches the customer's stated 6-month goal — book a call / buy a product /
      sign up for newsletter — not a generic "Learn more".
- [ ] Color + font choices match the vibe profile and the brand kit EXACTLY (no improvising).
- [ ] Mobile responsive — every section collapses cleanly under 768px.
- [ ] Zero Lorem Ipsum, zero "[Brand Name]" placeholders, zero "John Doe" testimonials.
- [ ] Zero banned vocabulary (see VOICE RULES above).
- [ ] Customer's verbatim phrases from the brief appear in headlines or pull-quotes.
- [ ] No other-brand contamination (no mentions of FamFit, Wone, IEI, etc — those are exemplars only).
`;

/**
 * SYSTEM prompt — STRUCTURE only. The vibe-specific direction is appended
 * per-call via vibePromptBlock() so each website variant gets its own
 * locked-in fonts/colors/layout signature.
 */
const SYSTEM_BASE = `You design ONE page of a 3-page brand website. The 3 pages share one VIBE (fonts, color strategy, layout signature) — they read like one cohesive product designed by one studio. Output a single self-contained HTML file with inline CSS and Google Fonts <link> in <head>. No external JS, no images, no <img> tags, no data: URIs. Use CSS shapes/gradients for any visuals.

The 3 pages are linked together via the brand's primary navigation. Each page you produce MUST include a top nav with: brand wordmark (links to "./home.html") + 3 nav links matching the menu listed in the user prompt's "Top-nav" section. The current page's nav link is bolded; other links are subdued. Nav hrefs MUST be RELATIVE (./home.html · ./about.html · ./<flex>.html) so the 3 pages link to siblings inside the same vibe folder.

ABSOLUTELY NO EMOJIS. No 🔗 ⚡ 📊 🧠 ✨ 🎯 🛡️ 📱 or any other emoji character anywhere — not as icons, not in headings, not inline. Use CSS-drawn geometric shapes (circles, squares, arrows, bars, brackets) or no icon at all. Emojis are the #1 tell of AI-generated design.

OUTPUT (JSON only, no prose, no markdown fences):
{
  "key": "<the page key passed in the user prompt — one of: home, about, services, products, events, booking, mixed>",
  "title": "<the page title from the user prompt>",
  "rationale": "<one sentence on how this page expresses the vibe for this brand>",
  "html": "<!DOCTYPE html>...</html>"
}

HTML constraints:
- <!DOCTYPE html> + <html lang="en">
- One <style> block in <head>; no external stylesheets except Google Fonts (loaded via <link rel="stylesheet">).
- Use the vibe's locked fonts and the brand's color palette via inline styles or CSS variables.
- Mobile responsive via @media (max-width: 768px) rules.
- Target ~5,000-7,000 characters of HTML per page. The exemplar (when provided) is for STYLE INSPIRATION ONLY — match its quality and structural sophistication, NOT its length or content.`;

function buildUser(
  brand: BrandForVariants,
  page: PageSpec,
  allPages: PageSpec[],
  vibe: Vibe,
  intake?: IntakeContext
): string {
  // Relative nav hrefs — these resolve as siblings within the vibe subfolder.
  const navMap = allPages
    .map((p) => `  ./${p.key}.html — ${p.title}`)
    .join("\n");
  return [
    `Design the "${page.title}" page (key: "${page.key}") of the "${vibe.name}" vibe version of this brand's 3-page website.`,
    "",
    "Page brief:",
    page.description,
    "",
    "Top-nav for all pages in this vibe (siblings inside ./" + safeSlug(vibe.slug) + "/):",
    navMap,
    "",
    "Copy requirements:",
    "  - Real marketing copy, not placeholder text.",
    "  - Derive headline + subhead from positioning + tone.",
    "  - Match the voice of the brand brief below — use the customer's verbatim phrases where natural.",
    "  - Channel the vibe's voice cue (above) in headlines and CTAs.",
    "",
    "Brand:",
    brandBrief(brand, intake),
  ].join("\n");
}

type ModelResponse = {
  key?: string;
  title?: string;
  rationale?: string;
  html?: string;
};

async function generateOne(
  brand: BrandForVariants,
  page: PageSpec,
  allPages: PageSpec[],
  vibe: Vibe,
  exemplar: string | null,
  industryBlock: string,
  intake?: IntakeContext
): Promise<ModelResponse | null> {
  const system = [
    SYSTEM_BASE,
    vibePromptBlock(vibe),
    exemplar ?? "",
    industryBlock,
    ANTI_SLOP_RULES,
    VOICE_RULES,
    SHIP_QUALITY_BAR,
  ]
    .filter(Boolean)
    .join("\n");

  let text: string | null = null;
  try {
    text = await callClaude({
      system,
      user: buildUser(brand, page, allPages, vibe, intake),
      maxTokens: 16000,
    });
  } catch (err) {
    console.warn(
      `[website] ${vibe.slug}/${page.key} call failed:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
  if (!text) return null;

  try {
    return parseJson<ModelResponse>(text);
  } catch (err) {
    console.warn(
      `[website] ${vibe.slug}/${page.key} parse failed:`,
      err instanceof Error ? err.message : err
    );
    return null;
  }
}

/**
 * Generate the 3 website versions × 3 pages = 9 HTML files.
 *
 * The `count` argument is retained for callsite backwards-compat but is now
 * always treated as 3 — every customer ships with three website versions.
 *
 * Returns 3 manifest items (one per vibe). Each item's `filename` is its home
 * page (for the FE picker iframe preview), and `pages[]` lists the about + flex
 * siblings so the caller (skill.ts) can publish them too — their relative nav
 * URLs only resolve once they're co-located in the published output store.
 */
export async function generateLandingVariants(
  brand: BrandForVariants,
  outputDir: string,
  count = 3,
  intake?: IntakeContext
): Promise<LandingVariant[]> {
  void count;

  const industry = pickIndustry({
    industry: intake?.industry,
    productDescription: intake?.productDescription,
    notes: intake?.notes,
  });
  const industryBlock = industryDirectionBlock(industry);
  if (industry) {
    console.log(`[website] industry match: ${industry.name}`);
  }

  const flex = pickFlexPage(intake);
  const pages = buildPageSpecs(flex);
  console.log(`[website] flex page picked: ${flex}`);

  const vibes = pickVibes(brand, intake);
  console.log(
    `[website] vibes picked: ${vibes.map((v) => v.slug).join(" · ")}`
  );

  // Load the FamFit exemplar ONCE — we only attach it to the home page of
  // each vibe (3 of the 9 calls) to keep token cost manageable. About and
  // flex pages get the vibe profile alone — that's enough signal to render
  // consistently within a vibe since fonts + colors + layout signature are
  // already locked.
  const exemplar = await landingExemplar();

  type Job = { vibe: Vibe; page: PageSpec };
  const jobs: Job[] = vibes.flatMap((vibe) =>
    pages.map((page) => ({ vibe, page }))
  );

  const dir = path.join(outputDir, "landing-variants");
  await fs.mkdir(dir, { recursive: true });

  // Fire all 9 calls in parallel — home pages get the exemplar, others don't.
  const responses = await Promise.all(
    jobs.map((job) =>
      generateOne(
        brand,
        job.page,
        pages,
        job.vibe,
        job.page.key === "home" ? exemplar : null,
        industryBlock,
        intake
      )
    )
  );

  // Write all generated HTML files to disk + group them by vibe for the manifest.
  type VibeBucket = {
    vibe: Vibe;
    home?: LandingVariantPage;
    others: LandingVariantPage[];
    homeRationale?: string;
  };
  const buckets: Record<string, VibeBucket> = {};
  for (const v of vibes) {
    buckets[v.slug] = { vibe: v, others: [] };
  }

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const res = responses[i];
    if (!res?.html || !res.html.includes("<html")) continue;

    // Always trust the JOB's page key, never the LLM's `res.key`. If the
    // model returns the wrong key (e.g. emits "services" on a home-page job),
    // letting that drive the filename collides with the actual services page
    // and silently overwrites it. The page brief in the prompt is sufficient
    // signal — the filename is ours to assign.
    const vibeSlug = safeSlug(job.vibe.slug);
    const pageKey = safeSlug(job.page.key);
    const relPath = `landing-variants/${vibeSlug}/${pageKey}.html`;
    await fs.mkdir(path.join(outputDir, "landing-variants", vibeSlug), {
      recursive: true,
    });
    await fs.writeFile(path.join(outputDir, relPath), res.html);

    const pageEntry: LandingVariantPage = {
      key: pageKey,
      // The page's display title is ours to assign too — it's always the
      // job spec's title, not the model's (which can drift from the asked page).
      title: job.page.title,
      filename: relPath,
    };

    if (job.page.key === "home") {
      buckets[job.vibe.slug].home = pageEntry;
      buckets[job.vibe.slug].homeRationale = res.rationale ?? "";
    } else {
      buckets[job.vibe.slug].others.push(pageEntry);
    }
  }

  // Build the manifest — one entry per vibe, pointing at its home page.
  // Skip any vibe whose home failed to generate (degraded but doesn't crash).
  const manifest: LandingVariant[] = [];
  for (const v of vibes) {
    const b = buckets[v.slug];
    if (!b.home) {
      console.warn(`[website] vibe "${v.slug}" missing home page — skipping`);
      continue;
    }
    manifest.push({
      key: v.slug,
      title: v.name,
      rationale: b.homeRationale || v.tagline,
      filename: b.home.filename,
      pages: b.others,
    });
  }

  return manifest;
}
