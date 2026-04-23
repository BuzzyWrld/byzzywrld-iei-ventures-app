import { z } from "zod";

export const BrandIntakeSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  toneOfVoice: z.string().min(1),
  competitors: z.string().optional().default(""),
  archetype: z.string().optional().default(""),
  palettePreference: z.string().optional().default(""),
  notes: z.string().optional().default(""),
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

export type BrandOutputs = {
  brandJson?: string;
  playbookHtml?: string;
  playbookPdf?: string;
  landingHtml?: string;
  logoSvg?: string;
  logoVariants?: LogoVariantRef[];
  landingVariants?: LandingVariantRef[];
  paletteExpansion?: PaletteExpansionRef;
  socialKit?: SocialAssetRef[];
  pitchOnePager?: PitchOnePagerRef;
  emailKit?: EmailKitRef;
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
