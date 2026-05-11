/**
 * Remotion Lambda video render integration.
 *
 * Triggers a 21-second personalized brand explainer video on AWS Lambda
 * using the pre-deployed Remotion composition. The composition expects
 * brand data (name, tagline, colors, fonts, mission, ICA, logo URL) as
 * inputProps and produces an MP4.
 *
 * Gated on 5 env vars — if any are missing, rendering is silently skipped
 * so the rest of the pipeline still works.
 */

import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";
import type { AwsRegion } from "@remotion/lambda/client";

export interface BrandVideoInput {
  brandName: string;
  tagline: string;
  colors: { primary: string; secondary: string; accent: string; neutral: string };
  typography: { heading: string; body: string };
  mission?: string;
  ica?: string;
  logoUrl?: string;
}

export interface VideoRenderResult {
  renderId: string;
  bucketName: string;
  outputUrl: string | null;
  error?: string;
}

function getRemotionConfig() {
  const region = process.env.REMOTION_AWS_REGION;
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_LAMBDA_SITE_NAME;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !functionName || !serveUrl || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { region: region as AwsRegion, functionName, serveUrl };
}

/** Returns true if all 5 Remotion env vars are configured. */
export function isVideoRenderEnabled(): boolean {
  return getRemotionConfig() !== null;
}

/**
 * Trigger a brand explainer video render on Remotion Lambda.
 * Returns the S3 output URL once rendering completes, or null on failure.
 *
 * This function polls until the render finishes (typically 15-45 seconds).
 */
export async function renderBrandVideo(
  input: BrandVideoInput,
  onProgress?: (pct: number) => void
): Promise<VideoRenderResult> {
  const config = getRemotionConfig();
  if (!config) {
    return { renderId: "", bucketName: "", outputUrl: null, error: "Remotion env vars not configured" };
  }

  const { region, functionName, serveUrl } = config;

  console.log(`[brand-video] starting render for "${input.brandName}"`);

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: "IEIExplainer",
    codec: "h264",
    inputProps: {
      brandName: input.brandName,
      tagline: input.tagline,
      primaryColor: input.colors.primary,
      secondaryColor: input.colors.secondary,
      accentColor: input.colors.accent,
      neutralColor: input.colors.neutral,
      headingFont: input.typography.heading,
      bodyFont: input.typography.body,
      mission: input.mission ?? "",
      ica: input.ica ?? "",
      logoUrl: input.logoUrl ?? "",
    },
    privacy: "public",
    maxRetries: 2,
    framesPerLambda: 20,
    downloadBehavior: {
      type: "download",
      fileName: `${input.brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-brand-video.mp4`,
    },
  });

  console.log(`[brand-video] render started: renderId=${renderId}, bucket=${bucketName}`);

  // Poll for completion
  const maxPolls = 120; // 2 minutes at 1s intervals
  for (let i = 0; i < maxPolls; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const progress = await getRenderProgress({
      renderId,
      bucketName,
      region,
      functionName,
    });

    if (progress.overallProgress !== undefined) {
      onProgress?.(progress.overallProgress);
    }

    if (progress.done) {
      const outputUrl = progress.outputFile ?? null;
      console.log(`[brand-video] render complete: ${outputUrl}`);
      return { renderId, bucketName, outputUrl };
    }

    if (progress.fatalErrorEncountered) {
      const errMsg = progress.errors?.[0]?.message ?? "Unknown render error";
      console.error(`[brand-video] render failed: ${errMsg}`);
      return { renderId, bucketName, outputUrl: null, error: errMsg };
    }
  }

  return { renderId, bucketName, outputUrl: null, error: "Render timed out after 2 minutes" };
}
