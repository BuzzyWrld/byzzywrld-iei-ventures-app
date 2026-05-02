/**
 * Industry-direction matcher. Maps a user's intake (industry + product
 * description) to the closest entry in the Design Inspiration table.
 * The matched entry's design notes feed every visual variant generator
 * (landing, pitch, dev-brief) so industry-appropriate aesthetics carry
 * through automatically.
 *
 * The reference file lives at
 *   skills/brand-playbook/references/industries.json
 * and is curated by the IEI team. Add new industries by editing that file.
 *
 * Matching is keyword-based, not LLM-based — fast, deterministic, free.
 * If no industry keyword hits, returns null and callers fall back to the
 * brand's archetype/tone signals on their own.
 */
import fs from "node:fs";
import path from "node:path";

export type IndustryEntry = {
  key: string;
  name: string;
  category: string | null;
  vibe: string | null;
  logoRef: string | null;
  websiteRef: string | null;
  collateralRef: string | null;
  functionality: string | null;
  notes: string | null;
};

let _cache: IndustryEntry[] | null = null;

function loadIndustries(): IndustryEntry[] {
  if (_cache) return _cache;
  const p = path.join(
    process.cwd(),
    "skills/brand-playbook/references/industries.json"
  );
  try {
    _cache = JSON.parse(fs.readFileSync(p, "utf8")) as IndustryEntry[];
    return _cache;
  } catch (err) {
    console.warn(`[industries] could not load reference file:`, err instanceof Error ? err.message : err);
    _cache = [];
    return _cache;
  }
}

/**
 * Keyword rules — ordered most-specific first. The first rule whose
 * keywords appear in the haystack wins. Keys must match an entry.key
 * in industries.json.
 */
const RULES: Array<{ key: string; keywords: string[] }> = [
  // ORDER MATTERS — first match wins. More-specific rules go first so a
  // broad keyword (e.g. "consult") doesn't poach a more specific match
  // (e.g. "marketing agency").
  // Agencies before consultants — "marketing strategy / agency" should
  // match Agencies even though "strategy" is also a consultant keyword.
  { key: "agencies",           keywords: ["agency", "marketing agency", "creative agency", "branding agency", "ad agency", "pr firm", "studio"] },
  // Financial services BEFORE accountants — "fintech / investment / brokerage"
  // brands shouldn't match the accountant rule on the word "account."
  { key: "financial-services", keywords: ["financial", "fintech", "wealth", "advisory", "private credit", "investment", "ria", "vc ", "venture cap", "capital markets", "asset management", "family office", "quant", "trading algorithm", "brokerage", "hedge fund", "robo-advisor"] },
  // Service businesses — note: "accountant" not "account" so "brokerage account" doesn't hit
  { key: "law-firms",          keywords: ["law firm", "attorney", "legal", "lawyer"] },
  { key: "accountants",        keywords: ["accountant", "accounting", "cpa", "bookkeep", "tax prep"] },
  { key: "consultants",        keywords: ["consult", "coach", "executive coach"] },
  // Creatives
  { key: "graphic-design",     keywords: ["graphic design", "designer", "art direction", "design studio"] },
  { key: "photography-studios",keywords: ["photo", "photographer", "photography"] },
  { key: "art-galleries",      keywords: ["gallery", "fine art", "curator"] },
  // Health & wellness
  { key: "yoga-studios",       keywords: ["yoga", "pilates"] },
  { key: "fitness-centers",    keywords: ["fitness", "gym", "personal trainer", "crossfit"] },
  { key: "chiropractors",      keywords: ["chiroprac", "physical therapy", "physio"] },
  { key: "massage-therapists", keywords: ["massage", "spa", "med-spa", "med spa", "wellness clinic", "aesthetic", "esthetician"] },
  // Beauty & hair
  { key: "estheticians",       keywords: ["esthetic", "skincare", "skin care", "facial"] },
  { key: "hair-stylists",      keywords: ["hair stylist", "hair salon", "salon"] },
  { key: "barber-shops",       keywords: ["barber"] },
  // E-commerce
  { key: "apparel-fashion",    keywords: ["apparel", "clothing", "fashion", "workwear", "streetwear", "menswear", "womenswear", "dtc"] },
  // Specific verticals
  { key: "car-wash",           keywords: ["car wash", "auto detail", "detailing"] },
  { key: "event-space",        keywords: ["venue", "event space", "wedding venue"] },
  { key: "contractors",        keywords: ["contractor", "construction", "general contractor", "remodel", "home build", "trade"] },
  { key: "non-profits",        keywords: ["nonprofit", "non-profit", "501c3", "charity", "foundation"] },
  // Org tier
  { key: "agencies",           keywords: ["agency", "marketing agency", "creative agency", "branding agency", "ad agency", "pr firm"] },
  { key: "organizations",      keywords: ["organization", "association", "council"] },
  { key: "event-page-one-pager", keywords: ["one-pager", "event page", "launch page", "landing page only"] },
  // Catch-all corporate
  { key: "corporations-mid-size-companies", keywords: ["enterprise", "corporate", "mid-size", "fortune"] },
];

/**
 * Pick the best industry direction for an intake. Searches across both
 * `industry` and `productDescription` (the latter often gives stronger
 * signal — "B2B SaaS" doesn't match anything but "AI-powered candidate
 * screening" might match a future SaaS entry).
 */
export function pickIndustry(intake: {
  industry?: string;
  productDescription?: string;
  notes?: string;
}): IndustryEntry | null {
  const industries = loadIndustries();
  if (!industries.length) return null;

  const haystack = [
    intake.industry ?? "",
    intake.productDescription ?? "",
    intake.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();

  for (const rule of RULES) {
    if (rule.keywords.some((k) => haystack.includes(k.toLowerCase()))) {
      const match = industries.find((i) => i.key === rule.key);
      if (match) return match;
    }
  }
  return null;
}

/**
 * Format an industry entry as a prompt-injectable block. Returns "" if
 * no entry was matched (caller should fall back to brand-level signals).
 */
export function industryDirectionBlock(entry: IndustryEntry | null): string {
  if (!entry) return "";
  const lines = [
    "",
    `--- INDUSTRY DIRECTION (${entry.name}${entry.category ? ` · ${entry.category}` : ""}) ---`,
    "Match this design direction. It is curated by the IEI team for this industry.",
    "",
  ];
  if (entry.vibe) lines.push(`Aesthetic vibe: ${entry.vibe}`);
  if (entry.functionality) lines.push(`Required functionality: ${entry.functionality}`);
  if (entry.notes) lines.push(`Design notes: ${entry.notes}`);
  lines.push("--- END INDUSTRY DIRECTION ---", "");
  return lines.join("\n");
}
