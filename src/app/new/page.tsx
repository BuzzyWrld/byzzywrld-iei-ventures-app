"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandIntake } from "@/lib/types";
import {
  ArchetypeStep,
  ToneStep,
  PaletteStep,
  LogoStyleStep,
  LogoStep,
  expandPaletteForSubmit,
} from "./_steps";

type StepKey =
  | "company"
  | "story"
  | "product"
  | "audience"
  | "tone"
  | "archetype"
  | "palette"
  | "logo-style"
  | "logo"
  | "review";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "story", label: "Your story" },
  { key: "product", label: "Product" },
  { key: "audience", label: "Audience" },
  { key: "tone", label: "Tone" },
  { key: "archetype", label: "Archetype" },
  { key: "palette", label: "Palette" },
  { key: "logo-style", label: "Logo style" },
  { key: "logo", label: "Logo" },
  { key: "review", label: "Review" },
];

/** Story field is required (not optional) but the floor is low — 30 chars is
 *  enough for a one-line "why we exist." We tell the user a longer story
 *  produces a richer brand, but we won't gate them at 200 characters. */
const STORY_MIN_CHARS = 30;

const EMPTY: BrandIntake = {
  companyName: "",
  productDescription: "",
  industry: "",
  targetAudience: "",
  toneOfVoice: "",
  competitors: "",
  archetype: "",
  palettePreference: "",
  notes: "",
  uploadedLogoPath: "",
  mode: "quick",
  logoStyle: "",
  logoInspirationUrls: "",
  objectives: [],
  companyBackground: "",
  tagline: "",
  brandEssence: "",
  uniqueAbility: "",
  vision: "",
  mission: "",
  coreValues: [],
  brandStory: "",
  why: "",
  legacy: "",
  quotables: "",
  personalityTraits: [],
  toneVoiceDescription: "",
  interactionStyle: "",
  personaType: "",
  valueProposition: "",
  products: [],
  competitorsList: [],
};

export default function NewBrandPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [intake, setIntake] = useState<BrandIntake>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIdx];
  const set = (patch: Partial<BrandIntake>) => setIntake((i) => ({ ...i, ...patch }));

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "company":   return intake.companyName.trim().length > 0;
      case "story":     return intake.notes.trim().length >= STORY_MIN_CHARS;
      case "product":   return intake.productDescription.trim().length >= 20;
      case "audience":  return intake.industry.trim().length > 0 && intake.targetAudience.trim().length > 0;
      case "tone":      return intake.toneOfVoice.split(",").map((s) => s.trim()).filter(Boolean).length >= 1;
      case "archetype": return intake.archetype.trim().length > 0;
      case "palette":   return intake.palettePreference.trim().length > 0;
      case "logo-style":return true;  // optional — defaults blank
      case "logo":      return true;  // optional; default = create
      case "review":    return true;
    }
  }, [step, intake]);

  const next = () => {
    if (!canContinue) return;
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
    else void submit();
  };
  const back = () => setStepIdx(Math.max(0, stepIdx - 1));

  async function submit() {
    setSubmitting(true);
    setError(null);
    const intakeWithHexes = expandPaletteForSubmit(intake);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intakeWithHexes),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setSubmitting(false);
      return;
    }
    const { project } = (await res.json()) as { project: { id: string } };
    router.push(`/brands/${project.id}`);
  }

  return (
    <>
      {/* Mode switch + step counter */}
      <div className="flex items-center justify-between gap-6 mb-1">
        <div className="flex gap-1.5 text-xs font-mono">
          <span
            className="px-2 py-1 rounded"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            New brand
          </span>
          <Link
            href="/new/existing"
            className="px-2 py-1 rounded"
            style={{ color: "var(--color-text-muted)" }}
          >
            I have existing assets
          </Link>
          <Link
            href="/new/deep"
            className="px-2 py-1 rounded"
            style={{ color: "var(--color-text-muted)" }}
          >
            Deep questionnaire (~20 min)
          </Link>
        </div>
        <div className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
          Step {stepIdx + 1} of {STEPS.length}
        </div>
      </div>

      <Stepper current={stepIdx} />

      <div className="max-w-[820px]">
        <div className="kicker mb-3">
          Question {String(stepIdx + 1).padStart(2, "0")}
        </div>

        {step.key === "company" && (
          <CompanyStep intake={intake} onChange={set} onSubmit={next} />
        )}
        {step.key === "story" && (
          <YourStoryStep intake={intake} onChange={set} />
        )}
        {step.key === "product" && (
          <ProductStep intake={intake} onChange={set} />
        )}
        {step.key === "audience" && (
          <AudienceStep intake={intake} onChange={set} onSubmit={next} />
        )}
        {step.key === "tone" && (
          <ToneStep intake={intake} onChange={set} />
        )}
        {step.key === "archetype" && (
          <ArchetypeStep intake={intake} onChange={set} />
        )}
        {step.key === "palette" && (
          <PaletteStep intake={intake} onChange={set} />
        )}
        {step.key === "logo-style" && (
          <LogoStyleStep intake={intake} onChange={set} />
        )}
        {step.key === "logo" && (
          <LogoStep intake={intake} onChange={set} />
        )}
        {step.key === "review" && (
          <ReviewStep intake={intake} onChange={set} />
        )}

        <div className="mt-8 flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={stepIdx === 0 || submitting}
            onClick={back}
          >
            ← Back
          </button>
          <button
            type="button"
            className="btn btn-primary ml-auto"
            disabled={!canContinue || submitting}
            onClick={next}
          >
            {submitting ? (
              <>
                <span className="spinner" /> Running skill…
              </>
            ) : stepIdx === STEPS.length - 1 ? (
              "Build my brand"
            ) : (
              <>
                Continue{" "}
                <span
                  className="kbd"
                  style={{
                    color: "inherit",
                    background: "rgba(255,255,255,.12)",
                    borderColor: "rgba(255,255,255,.2)",
                  }}
                >
                  ↵
                </span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm" style={{ color: "var(--color-status-failed)" }}>
            {error}
          </p>
        )}
      </div>
    </>
  );
}

/* ---------------- Stepper ---------------- */

function Stepper({ current }: { current: number }) {
  return (
    <div className="mt-4 mb-8">
      <div className="flex items-center gap-0 w-full overflow-x-auto">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const pending = i > current;
          const circleBg = done ? "var(--color-primary)" : "var(--color-surface)";
          const circleColor = done
            ? "var(--color-surface)"
            : active
            ? "var(--color-primary)"
            : "var(--color-text-muted)";
          const circleBorder = done || active ? "var(--color-primary)" : "var(--color-border)";
          const labelColor = pending ? "var(--color-text-muted)" : "var(--color-text)";
          return (
            <div key={s.key} className="flex items-center" style={{ flex: i === STEPS.length - 1 ? "0 0 auto" : "1 1 0" }}>
              <div className="flex items-center gap-2.5 shrink-0" style={{ color: labelColor }}>
                <span
                  className="inline-flex items-center justify-center font-mono text-[11px] shrink-0"
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    border: `1.5px solid ${circleBorder}`,
                    background: circleBg,
                    color: circleColor,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="text-sm whitespace-nowrap">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-px flex-1 min-w-[18px] mx-3"
                  style={{ background: done ? "var(--color-primary)" : "var(--color-border)" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Quick-flow-only steps ---------------- */

function CompanyStep({
  intake,
  onChange,
  onSubmit,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 48 }}>
        What&apos;s the company called?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Legal, operating, or working name — whichever you want the brand system built around.
      </p>
      <input
        className="input input-lg"
        placeholder="e.g. Aurelian Labs"
        value={intake.companyName}
        onChange={(e) => onChange({ companyName: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter" && intake.companyName.trim()) onSubmit();
        }}
        autoFocus
      />
    </>
  );
}

/**
 * The single most important field in the questionnaire. The model pulls
 * from `notes` near-verbatim into brandStory, voice, and ICA. Generic
 * intake → generic brand. The user's own words → a brand that feels theirs.
 *
 * Required (not optional). Floor of 30 chars to enforce a real answer
 * without gating users who genuinely have a one-line "why."
 */
function YourStoryStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const len = intake.notes.trim().length;
  const remaining = Math.max(0, STORY_MIN_CHARS - len);
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Tell us your story.
      </h1>
      <p className="text-base mb-2" style={{ color: "var(--color-text-muted)", maxWidth: "60ch" }}>
        Where did this brand come from? What were you doing before? What made you start?
        Anything that makes this brand <em>yours</em> and not generic.
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "60ch" }}>
        This is the most important field in the whole questionnaire — the AI uses your answer
        almost verbatim to write the brand&apos;s mission, voice, and origin story.
        Every other output gets richer the more you put here. Even one strong sentence helps.
      </p>
      <textarea
        className="textarea"
        rows={7}
        placeholder={
          "e.g. Founded by an ex-Citadel quant who watched retail investors get crushed in 2022 while his institutional clients held steady. Realized retail has no access to risk-adjusted strategies — just target-date funds on one end and Reddit YOLOs on the other. Built ACI to put institutional engines into a retail brokerage account."
        }
        value={intake.notes}
        onChange={(e) => onChange({ notes: e.target.value })}
        autoFocus
        style={{ fontSize: 16 }}
      />
      <p className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
        {remaining > 0
          ? `${remaining} more characters needed.`
          : `${len} characters. ${len >= 150 ? "Strong." : "Good — feel free to add more for a richer brand."}`}
      </p>
    </>
  );
}

function ProductStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const len = intake.productDescription.trim().length;
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What does {intake.companyName || "this business"} actually do?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "54ch" }}>
        In 2–3 sentences — the product, service, or offering. Be specific. The more concrete and detailed you are here, the better.
      </p>
      <textarea
        className="textarea"
        rows={5}
        placeholder={
          "e.g. We make clean-label electrolyte supplements for people recovering from nights out. Single-serve sachets, fruit flavors, available DTC."
        }
        value={intake.productDescription}
        onChange={(e) => onChange({ productDescription: e.target.value })}
        autoFocus
        style={{ fontSize: 16 }}
      />
      <p className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
        {len < 20
          ? `${20 - len} more characters needed — keep going.`
          : `${len} characters. Good detail.`}
      </p>
    </>
  );
}

function AudienceStep({
  intake,
  onChange,
  onSubmit,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
  onSubmit: () => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Who is this for, and where do they live?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Industry anchors the archetype; audience shapes tone.
      </p>
      <label className="block mb-4">
        <div className="kicker mb-2">Industry</div>
        <input
          className="input"
          placeholder="e.g. AI / Financial Services"
          value={intake.industry}
          onChange={(e) => onChange({ industry: e.target.value })}
        />
      </label>
      <label className="block">
        <div className="kicker mb-2">Target audience</div>
        <input
          className="input"
          placeholder="e.g. Capital markets operators"
          value={intake.targetAudience}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && intake.industry && intake.targetAudience) onSubmit();
          }}
        />
      </label>
    </>
  );
}

function ReviewStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        A last look before we build.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Building takes 3&ndash;5 minutes. We&apos;ll show you 3 logo options first &mdash; pick one, then the rest of the kit builds around it.
      </p>
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-6 text-sm">
          <ReviewRow label="Company" value={intake.companyName} />
          <ReviewRow label="Your story" value={intake.notes} />
          <ReviewRow label="Product" value={intake.productDescription} />
          <ReviewRow label="Industry" value={intake.industry} />
          <ReviewRow label="Audience" value={intake.targetAudience} />
          <ReviewRow label="Tone" value={intake.toneOfVoice || "—"} />
          <ReviewRow label="Archetype" value={intake.archetype || "—"} />
          <ReviewRow label="Palette" value={intake.palettePreference || "AI will choose"} />
          <ReviewRow label="Logo style" value={intake.logoStyle || "AI will choose"} />
          <ReviewRow
            label="Logo"
            value={intake.uploadedLogoPath ? "Uploaded by you" : "Generate 3 options"}
          />
        </div>
      </div>
      <label className="block">
        <div className="kicker mb-2">Competitors (optional)</div>
        <input
          className="input"
          placeholder="e.g. Hebbia, Harvey"
          value={intake.competitors}
          onChange={(e) => onChange({ competitors: e.target.value })}
        />
      </label>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ color: "var(--color-text-muted)" }}>{label}</div>
      <div>{value || "—"}</div>
    </>
  );
}
