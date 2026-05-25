import { NextRequest } from "next/server";
import { after } from "next/server";
import { enqueueBrandBuild } from "@/lib/skill";
import { currentTenant } from "@/lib/current-tenant";
import { currentUser } from "@/lib/auth";
import { BrandIntakeSchema } from "@/lib/types";

export const maxDuration = 300;

/**
 * Maps user-facing questionnaire answers to the BrandIntake schema
 * expected by the brand-playbook skill.
 */
function mapAnswersToBrandIntake(
  answers: Record<string, unknown>,
  mode: string
) {
  // Q1: brand name + essence
  const q1 = answers.q1 as Record<string, string> | undefined;
  const companyName = q1?.name || String(answers.q1_brand_name || "");
  const productDescription = q1?.essence || String(answers.q1_essence || "");

  // Q2: industry
  const q2 = answers.q2 as Record<string, string> | undefined;
  const industry = q2?.industry || String(answers.q2_industry || "");

  // Q3: audience
  const q3 = answers.q3 as Record<string, unknown> | undefined;
  const targetAudience =
    typeof q3 === "string"
      ? q3
      : (q3?.text as string) || String(answers.q3_audience || "");

  // Q4: competitors
  const q4 = answers.q4 as string[] | undefined;
  const competitors = Array.isArray(q4)
    ? q4.filter(Boolean).join(", ")
    : String(answers.q4_competitors || "");

  // Q5: personality / tone
  const q5 = answers.q5 as string[] | undefined;
  const toneOfVoice = Array.isArray(q5)
    ? q5.join(", ")
    : String(answers.q5_personality || "");

  // Q6: offerings
  const q6 = answers.q6 as string[] | undefined;
  const offerings = Array.isArray(q6) ? q6.filter(Boolean).join(", ") : "";

  // Q7: pain point
  const q7 = typeof answers.q7 === "string" ? answers.q7 : "";

  // Q8: success vision
  const q8 = typeof answers.q8 === "string" ? answers.q8 : "";

  // Q9: design prefs
  const q9 = answers.q9 as Record<string, string> | undefined;
  const palettePreference = q9?.colors || "";

  // Build notes from offerings + pain + success
  const notes = [
    offerings && `Offerings: ${offerings}`,
    q7 && `Pain point: ${q7}`,
    q8 && `12-month vision: ${q8}`,
  ]
    .filter(Boolean)
    .join("\n");

  return BrandIntakeSchema.parse({
    companyName: companyName || "Untitled Brand",
    productDescription: productDescription || "Brand build via intake",
    industry: industry || "general",
    targetAudience: targetAudience || "general audience",
    toneOfVoice: toneOfVoice || "professional",
    competitors,
    palettePreference,
    notes,
  });
}

export async function POST(request: NextRequest) {
  const [tenant, user] = await Promise.all([currentTenant(), currentUser()]);
  if (!user) return Response.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { session_id, intake_mode, user_answers } = body;

  const intake = mapAnswersToBrandIntake(user_answers || {}, intake_mode || "questionnaire");

  const { project, work } = await enqueueBrandBuild(intake, {
    tenantId: tenant.id,
    userId: user.id,
  });

  after(async () => {
    try {
      await work;
    } catch (err) {
      console.error("[build/start] background brand build failed:", err);
    }
  });

  return Response.json(
    {
      build_id: project.id,
      status: "processing",
      eta_seconds: 75,
      poll_url: `/api/build/status/${project.id}`,
    },
    { status: 202 }
  );
}
