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

export type BrandOutputs = {
  brandJson?: string;
  playbookHtml?: string;
  playbookPdf?: string;
  landingHtml?: string;
  logoSvg?: string;
  logoVariants?: LogoVariantRef[];
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
