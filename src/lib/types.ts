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
  name: string;
  tagline: string;
  colors: { primary: string; secondary: string; accent: string; neutral: string };
  typography: { heading: string; body: string };
  tone: string[];
  positioning: string;
};

export type LogoVariantRef = {
  key: string;
  title: string;
  rationale: string;
  url: string;
};

export type LandingVariantRef = {
  key: string;
  title: string;
  rationale: string;
  url: string;
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
