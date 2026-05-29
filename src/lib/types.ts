import { z } from "zod";

export const BrandIntakeSchema = z.object({
  companyName: z.string().min(1),
  productDescription: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  toneOfVoice: z.string().min(1),
  competitors: z.string().optional().default(""),
  archetype: z.string().optional().default(""),
  /** Palette preference. Empty string means "let AI choose based on color theory + brand". */
  palettePreference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  /** If set, user uploaded their own logo and we should skip variant generation.
   *  Format: "/api/uploads/<sessionId>/<filename>" */
  uploadedLogoPath: z.string().optional().default(""),

  /** "quick" (8-step) or "deep" (full Worksheet 2 dossier). */
  mode: z.enum(["quick", "deep"]).optional().default("quick"),

  // --- Logo questionnaire (Quick + Deep) ---
  /** Logo style direction: cartoonish | realistic | professional | playful | minimal | vintage */
  logoStyle: z.string().optional().default(""),
  /** Optional Pinterest / inspiration URLs (comma- or newline-separated). */
  logoInspirationUrls: z.string().optional().default(""),

  // --- Deep mode (all optional) ---
  // Step 1: Identity
  objectives: z.array(z.string()).optional().default([]),
  companyBackground: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
  brandEssence: z.string().optional().default(""),
  uniqueAbility: z.string().optional().default(""),
  // Step 2: Mission/Vision/Values
  vision: z.string().optional().default(""),
  mission: z.string().optional().default(""),
  coreValues: z.array(z.string()).optional().default([]),
  // Step 3: Brand Story
  brandStory: z.string().optional().default(""),
  why: z.string().optional().default(""),
  legacy: z.string().optional().default(""),
  quotables: z.string().optional().default(""),
  // Step 4: Persona
  personalityTraits: z.array(z.string()).optional().default([]),
  toneVoiceDescription: z.string().optional().default(""),
  interactionStyle: z.string().optional().default(""),
  personaType: z.string().optional().default(""),
  // Step 5: Value
  valueProposition: z.string().optional().default(""),
  // Step 6: Products (structured)
  products: z.array(z.object({
    name: z.string(),
    features: z.string(),
    benefits: z.string(),
  })).optional().default([]),
  // Step 7: Competitors (structured)
  competitorsList: z.array(z.object({
    name: z.string(),
    website: z.string().optional().default(""),
    instagram: z.string().optional().default(""),
  })).optional().default([]),
});
export type BrandIntake = z.infer<typeof BrandIntakeSchema>;

export type BrandJson = {
  // --- visual identity ---
  name: string;
  tagline: string;
  colors: { primary: string; secondary: string; accent: string; neutral: string };
  typography: { heading: string; body: string };
  tone: string[];
  positioning: string;

  // --- brand soul (added in Fix 2: makes brand identity survive even if
  //     playbook rendering hiccups, gives all variants a shared source of truth) ---
  /** One-sentence mission statement. */
  mission?: string;
  /** One-sentence vision statement. */
  vision?: string;
  /** 3-5 core values, each a short phrase. */
  values?: string[];
  /** 2-4 sentence brand origin / why story. Pulls from intake.notes when present. */
  brandStory?: string;
  /** Voice attributes: do/don't list. `say` = on-voice phrases. `dont` = anti-voice. */
  voice?: { say: string[]; dont: string[] };
  /** One-paragraph ideal customer archetype description. */
  ica?: string;
};

export type LogoVariantRef = {
  key: string;
  title: string;
  rationale: string;
  url: string;
};

/**
 * One website version in the brand kit. Each LandingVariantRef is the HOME
 * page of a vibe (Editorial Density / Type-as-Art / etc) — `url` previews
 * that home in the FE picker. The `pages` array lists sibling about + flex
 * pages of the same vibe; they're published so the home's nav links resolve,
 * and the FE may deep-link to them. See src/lib/variants/vibes.ts.
 */
export type LandingVariantRef = {
  /** Vibe slug (e.g. "editorial-density") — doubles as the URL subfolder */
  key: string;
  /** Vibe name shown in the picker UI (e.g. "Editorial Density") */
  title: string;
  rationale: string;
  /** URL of this vibe's home page */
  url: string;
  /** About + flex pages of the same vibe — published siblings of the home */
  pages?: { key: string; title: string; url: string }[];
};

export type SocialAssetRef = {
  key: string;
  title: string;
  platform: string;
  size: string;
  url: string;
};

export type PaletteExpansionRef = {
  url: string;
  light: Record<string, string>;
  dark: Record<string, string>;
  semantic: Record<string, string>;
};

export type PitchOnePagerRef = {
  htmlUrl: string;
  pdfUrl?: string;
};

export type EmailKitRef = {
  headerUrl?: string;
  signatureUrl?: string;
};

/** Developer Brief — structured handoff document for whoever builds the website. */
export type DevBriefRef = {
  htmlUrl: string;
  pdfUrl?: string;
};

export type BrandOutputs = {
  brandJson?: string;
  playbookHtml?: string;
  playbookPdf?: string;
  landingHtml?: string;
  logoSvg?: string;
  logoVariants?: LogoVariantRef[];
  /** Which of the `logoVariants[].key`s the user picked as primary.
   *  Auto-set to the uploaded path's key when user uploaded their own. */
  primaryLogoKey?: string;
  landingVariants?: LandingVariantRef[];
  paletteExpansion?: PaletteExpansionRef;
  socialKit?: SocialAssetRef[];
  pitchOnePager?: PitchOnePagerRef;
  emailKit?: EmailKitRef;
  devBrief?: DevBriefRef;
  landingLiveUrl?: string;
};

export type BrandProject = {
  id: string;
  createdAt: string;
  status: "pending" | "running" | "complete" | "failed";
  intake: BrandIntake;
  outputs: BrandOutputs;
  error?: string;
  progressStage?: string;
  progressPct?: number;
  tenantId: string;
  userId?: string;
};
