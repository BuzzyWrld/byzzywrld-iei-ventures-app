"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BrandIntake } from "@/lib/types";
import {
  ArchetypeStep,
  PaletteStep,
  LogoStyleStep,
  LogoStep,
  TONE_OPTIONS,
  expandPaletteForSubmit,
} from "../_steps";

/* ---------------- Step config ---------------- */

type StepKey =
  | "objectives"
  | "identity"
  | "mission"
  | "story"
  | "persona"
  | "audience"
  | "products"
  | "competitors"
  | "visuals"
  | "logo"
  | "review";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "objectives",  label: "Objectives" },
  { key: "identity",    label: "Identity" },
  { key: "mission",     label: "Mission" },
  { key: "story",       label: "Story" },
  { key: "persona",     label: "Persona" },
  { key: "audience",    label: "Audience" },
  { key: "products",    label: "Products" },
  { key: "competitors", label: "Competitors" },
  { key: "visuals",     label: "Visuals" },
  { key: "logo",        label: "Logo" },
  { key: "review",      label: "Review" },
];

const INTERACTION_STYLES = [
  { key: "Formal",        title: "Formal",        blurb: "Polished, structured, professional." },
  { key: "Informal",      title: "Informal",      blurb: "Relaxed, conversational, accessible." },
  { key: "Friendly",      title: "Friendly",      blurb: "Warm, welcoming, approachable." },
  { key: "Authoritative", title: "Authoritative", blurb: "Decisive, expert, leads the room." },
  { key: "Mixed",         title: "Mixed",         blurb: "Adapts to context — formal where needed, casual elsewhere." },
];

const PERSONA_TYPES = [
  { key: "Mentor", title: "Mentor", blurb: "Wise, guiding, supportive teacher." },
  { key: "Friend", title: "Friend", blurb: "Equal, relatable, on your side." },
  { key: "Expert", title: "Expert", blurb: "Authoritative specialist with depth." },
  { key: "Coach",  title: "Coach",  blurb: "Motivating, accountable, action-oriented." },
];

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
  mode: "deep",
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
  products: [{ name: "", features: "", benefits: "" }],
  competitorsList: [],
};

/* ---------------- Page ---------------- */

export default function DeepBrandPage() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [intake, setIntake] = useState<BrandIntake>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Belt-and-suspenders: ensure mode is "deep" even if EMPTY is mutated upstream.
  useEffect(() => {
    if (intake.mode !== "deep") setIntake((i) => ({ ...i, mode: "deep" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = STEPS[stepIdx];
  const set = (patch: Partial<BrandIntake>) => setIntake((i) => ({ ...i, ...patch }));

  const canContinue = useMemo(() => {
    switch (step.key) {
      case "objectives":
        return intake.objectives.some((o) => o.trim().length > 0);
      case "identity":
        return intake.companyName.trim().length > 0;
      case "mission":
        return (
          intake.vision.trim().length > 0 ||
          intake.mission.trim().length > 0 ||
          intake.coreValues.some((v) => v.trim().length > 0)
        );
      case "story":
        return intake.brandStory.trim().length > 0 || intake.why.trim().length > 0;
      case "persona":
        return (
          intake.personalityTraits.length > 0 ||
          intake.toneVoiceDescription.trim().length > 0
        );
      case "audience":
        return (
          intake.industry.trim().length > 0 &&
          intake.targetAudience.trim().length > 0
        );
      case "products":
        return intake.products.some((p) => p.name.trim().length > 0);
      case "competitors":
        return true;  // optional
      case "visuals":
        return (
          intake.archetype.trim().length > 0 &&
          intake.palettePreference.trim().length > 0
        );
      case "logo":
        return true;  // logoStyle + uploadedLogoPath both optional
      case "review":
        return true;
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
    // Strip empty objectives / coreValues / products / competitors so we don't
    // ship blank rows the user left untouched.
    const cleaned: BrandIntake = {
      ...intake,
      mode: "deep",
      objectives: intake.objectives.map((o) => o.trim()).filter(Boolean),
      coreValues: intake.coreValues.map((v) => v.trim()).filter(Boolean),
      products: intake.products.filter((p) => p.name.trim().length > 0),
      competitorsList: intake.competitorsList.filter((c) => c.name.trim().length > 0),
      // The Quick flow has a single productDescription field — synthesize one
      // for /api/brands' min(1) requirement from the first deep product +
      // company background, so the existing schema validates.
      productDescription:
        intake.productDescription ||
        [intake.companyBackground, intake.products[0]?.benefits, intake.products[0]?.features]
          .filter(Boolean)
          .join("\n\n") ||
        intake.products[0]?.name ||
        intake.companyName ||
        "—",
      // Same for toneOfVoice — derive from personalityTraits if blank.
      toneOfVoice:
        intake.toneOfVoice ||
        intake.personalityTraits.filter(Boolean).join(", ") ||
        "confident, clear",
    };
    const intakeWithHexes = expandPaletteForSubmit(cleaned);
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
          <Link
            href="/new"
            className="px-2 py-1 rounded"
            style={{ color: "var(--color-text-muted)" }}
          >
            New brand
          </Link>
          <Link
            href="/new/existing"
            className="px-2 py-1 rounded"
            style={{ color: "var(--color-text-muted)" }}
          >
            I have existing assets
          </Link>
          <span
            className="px-2 py-1 rounded"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            Deep questionnaire (~20 min)
          </span>
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

        {step.key === "objectives" && (
          <ObjectivesStep intake={intake} onChange={set} />
        )}
        {step.key === "identity" && (
          <IdentityStep intake={intake} onChange={set} />
        )}
        {step.key === "mission" && (
          <MissionStep intake={intake} onChange={set} />
        )}
        {step.key === "story" && (
          <StoryStep intake={intake} onChange={set} />
        )}
        {step.key === "persona" && (
          <PersonaStep intake={intake} onChange={set} />
        )}
        {step.key === "audience" && (
          <AudienceStep intake={intake} onChange={set} />
        )}
        {step.key === "products" && (
          <ProductsStep intake={intake} onChange={set} />
        )}
        {step.key === "competitors" && (
          <CompetitorsStep intake={intake} onChange={set} />
        )}
        {step.key === "visuals" && (
          <VisualsStep intake={intake} onChange={set} />
        )}
        {step.key === "logo" && (
          <LogoCompositeStep intake={intake} onChange={set} />
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

/* ---------------- Primitives ---------------- */

function RepeatingRows({
  values,
  onChange,
  placeholder,
  min = 1,
  max = 5,
  inputType = "input",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  inputType?: "input" | "textarea";
}) {
  // Always show at least `min` rows. We pad without persisting the empty
  // strings into parent state on every render — only persist when the user
  // types into them.
  const padded = useMemo(() => {
    if (values.length >= min) return values;
    return [...values, ...Array(min - values.length).fill("")];
  }, [values, min]);

  function update(idx: number, v: string) {
    const next = [...padded];
    next[idx] = v;
    onChange(next);
  }
  function add() {
    if (padded.length >= max) return;
    onChange([...padded, ""]);
  }
  function remove(idx: number) {
    if (padded.length <= min) return;
    const next = padded.filter((_, i) => i !== idx);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      {padded.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          <span
            className="font-mono text-xs shrink-0 pt-2.5"
            style={{ color: "var(--color-text-muted)", width: 22 }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          {inputType === "textarea" ? (
            <textarea
              className="textarea flex-1"
              rows={2}
              placeholder={placeholder}
              value={v}
              onChange={(e) => update(i, e.target.value)}
            />
          ) : (
            <input
              className="input flex-1"
              placeholder={placeholder}
              value={v}
              onChange={(e) => update(i, e.target.value)}
            />
          )}
          {padded.length > min && (
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              aria-label="Remove row"
              onClick={() => remove(i)}
              style={{ marginTop: 2 }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3 3l8 8M11 3L3 11" />
              </svg>
            </button>
          )}
        </div>
      ))}
      {padded.length < max && (
        <button
          type="button"
          className="btn btn-ghost mt-1 self-start"
          onClick={add}
        >
          + Add another
        </button>
      )}
    </div>
  );
}

function RadioCardGroup<T extends string>({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: { key: T; title: string; blurb?: string }[];
  value: string;
  onChange: (v: T) => void;
  cols?: 2 | 3;
}) {
  const gridCols = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-1 ${gridCols} gap-3`}>
      {options.map((o) => {
        const on = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`card card-hover p-4 text-left ${on ? "ring-2" : ""}`}
            style={
              on
                ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
                : undefined
            }
          >
            <div className="font-medium tracking-tight mb-1">{o.title}</div>
            {o.blurb && (
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {o.blurb}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Steps ---------------- */

function ObjectivesStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What are your top 3 goals for this brand identity?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        What does success look like? E.g. &ldquo;Land enterprise customers,&rdquo; &ldquo;Look like a serious player at conferences,&rdquo; &ldquo;Justify a 10x price.&rdquo;
      </p>
      <RepeatingRows
        values={intake.objectives}
        onChange={(v) => onChange({ objectives: v })}
        placeholder="e.g. Be taken seriously by Fortune-500 buyers"
        min={3}
        max={3}
      />
    </>
  );
}

function IdentityStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Tell us who you are.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        The more concrete you are here, the more the brand will sound like you and not like a template.
      </p>
      <label className="block mb-4">
        <div className="kicker mb-2">Company name</div>
        <input
          className="input"
          placeholder="e.g. Aurelian Labs"
          value={intake.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Company background</div>
        <textarea
          className="textarea"
          rows={4}
          placeholder="3–4 sentences. What are you, when did you start, what problem are you solving, who's behind it?"
          value={intake.companyBackground}
          onChange={(e) => onChange({ companyBackground: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Tagline (optional)</div>
        <input
          className="input"
          placeholder="One short line. Skip if you don't have one yet."
          value={intake.tagline}
          onChange={(e) => onChange({ tagline: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Brand essence</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="If your brand were a person, what kind of person would they be? How would they walk into a room?"
          value={intake.brandEssence}
          onChange={(e) => onChange({ brandEssence: e.target.value })}
        />
      </label>
      <label className="block">
        <div className="kicker mb-2">Unique ability — your superpower</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="What can you do that nobody else does, or that you do meaningfully better?"
          value={intake.uniqueAbility}
          onChange={(e) => onChange({ uniqueAbility: e.target.value })}
        />
      </label>
    </>
  );
}

function MissionStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Vision, mission, and values.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Vision = the world you&apos;re trying to create. Mission = what you do, every day, to get there. Values = how you operate while doing it.
      </p>
      <label className="block mb-4">
        <div className="kicker mb-2">Vision</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="The future state you want to bring about. Aspirational, long-horizon."
          value={intake.vision}
          onChange={(e) => onChange({ vision: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Mission</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="What you actually do, for whom, and why it matters."
          value={intake.mission}
          onChange={(e) => onChange({ mission: e.target.value })}
        />
      </label>
      <div className="block">
        <div className="kicker mb-2">Core values (3–5)</div>
        <RepeatingRows
          values={intake.coreValues}
          onChange={(v) => onChange({ coreValues: v })}
          placeholder="e.g. Rigor over flash"
          min={3}
          max={5}
        />
      </div>
    </>
  );
}

function StoryStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const len = intake.brandStory.trim().length;
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Tell us your story.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        The origin, the why, the legacy. This becomes the spine of your About page, your pitch, and the way the brand talks about itself for years.
      </p>
      <label className="block mb-4">
        <div className="kicker mb-2">Brand story</div>
        <textarea
          className="textarea"
          rows={6}
          placeholder="How did this start? What did you see that others didn't? Why does it matter that you, specifically, are building this?"
          value={intake.brandStory}
          onChange={(e) => onChange({ brandStory: e.target.value })}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
          {len < 60 ? `${60 - len} more characters helps — keep going.` : `${len} characters. Good detail.`}
        </p>
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Why</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Why this, why now, why you?"
          value={intake.why}
          onChange={(e) => onChange({ why: e.target.value })}
        />
      </label>
      <label className="block mb-4">
        <div className="kicker mb-2">Legacy</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="In 10 years, what will people say this brand changed?"
          value={intake.legacy}
          onChange={(e) => onChange({ legacy: e.target.value })}
        />
      </label>
      <label className="block">
        <div className="kicker mb-2">Quotables (optional)</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Any phrases, mantras, or one-liners that capture the brand's worldview. One per line."
          value={intake.quotables}
          onChange={(e) => onChange({ quotables: e.target.value })}
        />
      </label>
    </>
  );
}

function PersonaStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  // personalityTraits is stored as string[]. The UI is a single text input
  // that the user edits as a comma-separated list — easier to type than
  // managing repeating rows. The TONE_OPTIONS are pills you click to insert.
  const traitsStr = intake.personalityTraits.join(", ");
  const setTraits = (s: string) => {
    const list = s.split(",").map((t) => t.trim()).filter(Boolean);
    onChange({ personalityTraits: list });
  };
  const toggleTrait = (t: string) => {
    const exists = intake.personalityTraits.includes(t);
    const next = exists
      ? intake.personalityTraits.filter((x) => x !== t)
      : [...intake.personalityTraits, t];
    onChange({ personalityTraits: next });
  };

  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        If your brand were a person…
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Personality drives the voice. Voice drives every word of copy.
      </p>
      <label className="block mb-3">
        <div className="kicker mb-2">Personality traits</div>
        <input
          className="input"
          placeholder="e.g. confident, dry-witted, generous, never theatrical"
          value={traitsStr}
          onChange={(e) => setTraits(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2 mb-6">
        {TONE_OPTIONS.map((word) => {
          const isOn = intake.personalityTraits.includes(word);
          return (
            <button
              key={word}
              type="button"
              className={`pill ${isOn ? "pill-selected" : ""}`}
              onClick={() => toggleTrait(word)}
            >
              {word}
              {isOn && (
                <span aria-hidden="true" style={{ marginLeft: 4 }}>
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      <label className="block mb-6">
        <div className="kicker mb-2">Tone &amp; voice description</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="How does the brand actually sound? E.g. 'Confident but never bombastic. Specific. Uses fewer words than expected.'"
          value={intake.toneVoiceDescription}
          onChange={(e) => onChange({ toneVoiceDescription: e.target.value })}
        />
      </label>

      <div className="block mb-6">
        <div className="kicker mb-2">Interaction style</div>
        <RadioCardGroup
          options={INTERACTION_STYLES}
          value={intake.interactionStyle}
          onChange={(v) => onChange({ interactionStyle: v })}
          cols={3}
        />
      </div>

      <div className="block">
        <div className="kicker mb-2">Persona archetype</div>
        <RadioCardGroup
          options={PERSONA_TYPES}
          value={
            PERSONA_TYPES.some((p) => p.key === intake.personaType)
              ? intake.personaType
              : ""
          }
          onChange={(v) => onChange({ personaType: v })}
        />
        <label className="block mt-3">
          <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
            Or describe your own:
          </div>
          <input
            className="input"
            placeholder="e.g. The seasoned editor, the senior partner, the trusted operator…"
            value={
              PERSONA_TYPES.some((p) => p.key === intake.personaType)
                ? ""
                : intake.personaType
            }
            onChange={(e) => onChange({ personaType: e.target.value })}
          />
        </label>
      </div>
    </>
  );
}

function AudienceStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Who is this for?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Specificity wins. &ldquo;Mid-market FP&amp;A leaders at $50–500M companies&rdquo; &gt; &ldquo;business people.&rdquo;
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
      <label className="block mb-4">
        <div className="kicker mb-2">Target audience</div>
        <textarea
          className="textarea"
          rows={4}
          placeholder="Who are they, what do they care about, what frustrates them, what would make them choose you over the status quo?"
          value={intake.targetAudience}
          onChange={(e) => onChange({ targetAudience: e.target.value })}
        />
      </label>
      <label className="block">
        <div className="kicker mb-2">Value proposition</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="What you give them, why it matters, why it's better than alternatives."
          value={intake.valueProposition}
          onChange={(e) => onChange({ valueProposition: e.target.value })}
        />
      </label>
    </>
  );
}

function ProductsStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const products = intake.products.length > 0 ? intake.products : [{ name: "", features: "", benefits: "" }];

  function update(idx: number, patch: Partial<{ name: string; features: string; benefits: string }>) {
    const next = products.map((p, i) => (i === idx ? { ...p, ...patch } : p));
    onChange({ products: next });
  }
  function add() {
    if (products.length >= 3) return;
    onChange({ products: [...products, { name: "", features: "", benefits: "" }] });
  }
  function remove(idx: number) {
    if (products.length <= 1) return;
    onChange({ products: products.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What are you selling?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Up to 3 products or services. Features = what it does. Benefits = what changes for the person who uses it.
      </p>
      <div className="flex flex-col gap-4">
        {products.map((p, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="kicker">Product {String(i + 1).padStart(2, "0")}</div>
              {products.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Remove product"
                  onClick={() => remove(i)}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3L3 11" />
                  </svg>
                </button>
              )}
            </div>
            <label className="block mb-3">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Name</div>
              <input
                className="input"
                placeholder="e.g. Tower"
                value={p.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </label>
            <label className="block mb-3">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Features</div>
              <textarea
                className="textarea"
                rows={3}
                placeholder="What does it do? Key capabilities, one per line."
                value={p.features}
                onChange={(e) => update(i, { features: e.target.value })}
              />
            </label>
            <label className="block">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Benefits</div>
              <textarea
                className="textarea"
                rows={3}
                placeholder="What changes for the customer? Outcomes, not features."
                value={p.benefits}
                onChange={(e) => update(i, { benefits: e.target.value })}
              />
            </label>
          </div>
        ))}
        {products.length < 3 && (
          <button type="button" className="btn btn-ghost self-start" onClick={add}>
            + Add another product
          </button>
        )}
      </div>
    </>
  );
}

function CompetitorsStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const competitors = intake.competitorsList.length > 0 ? intake.competitorsList : [{ name: "", website: "", instagram: "" }];

  function update(idx: number, patch: Partial<{ name: string; website: string; instagram: string }>) {
    const next = competitors.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange({ competitorsList: next });
  }
  function add() {
    if (competitors.length >= 3) return;
    onChange({ competitorsList: [...competitors, { name: "", website: "", instagram: "" }] });
  }
  function remove(idx: number) {
    if (competitors.length <= 1) return;
    onChange({ competitorsList: competitors.filter((_, i) => i !== idx) });
  }

  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Who are you up against?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Up to 3 competitors. Optional, but specific names help us position you against them. Skip if you genuinely don&apos;t have any.
      </p>
      <div className="flex flex-col gap-4">
        {competitors.map((c, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="kicker">Competitor {String(i + 1).padStart(2, "0")}</div>
              {competitors.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Remove competitor"
                  onClick={() => remove(i)}
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 3l8 8M11 3L3 11" />
                  </svg>
                </button>
              )}
            </div>
            <label className="block mb-3">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Name</div>
              <input
                className="input"
                placeholder="e.g. Hebbia"
                value={c.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
            </label>
            <label className="block mb-3">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Website</div>
              <input
                className="input"
                placeholder="https://example.com"
                value={c.website ?? ""}
                onChange={(e) => update(i, { website: e.target.value })}
              />
            </label>
            <label className="block">
              <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>Instagram</div>
              <input
                className="input"
                placeholder="@handle or https://instagram.com/handle"
                value={c.instagram ?? ""}
                onChange={(e) => update(i, { instagram: e.target.value })}
              />
            </label>
          </div>
        ))}
        {competitors.length < 3 && (
          <button type="button" className="btn btn-ghost self-start" onClick={add}>
            + Add another competitor
          </button>
        )}
      </div>
    </>
  );
}

function VisualsStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <ArchetypeStep intake={intake} onChange={onChange} />
      <div className="mt-10">
        <PaletteStep intake={intake} onChange={onChange} />
      </div>
    </>
  );
}

function LogoCompositeStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <LogoStyleStep intake={intake} onChange={onChange} />
      <div className="mt-10">
        <LogoStep intake={intake} onChange={onChange} />
      </div>
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
  const objectives = intake.objectives.filter(Boolean);
  const coreValues = intake.coreValues.filter(Boolean);
  const products = intake.products.filter((p) => p.name.trim());
  const competitors = intake.competitorsList.filter((c) => c.name.trim());

  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        A last look before we build.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        This takes a few minutes to run. Add anything else the skill should know.
      </p>

      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-y-3 gap-x-6 text-sm">
          <ReviewRow label="Mode" value="Deep dossier" />
          <ReviewRow label="Company" value={intake.companyName} />
          <ReviewRow label="Tagline" value={intake.tagline || "—"} />
          <ReviewRow label="Background" value={intake.companyBackground || "—"} />
          <ReviewRow label="Brand essence" value={intake.brandEssence || "—"} />
          <ReviewRow label="Unique ability" value={intake.uniqueAbility || "—"} />
          <ReviewRow
            label="Top objectives"
            value={objectives.length ? objectives.map((o, i) => `${i + 1}. ${o}`).join("  ·  ") : "—"}
          />
          <ReviewRow label="Vision" value={intake.vision || "—"} />
          <ReviewRow label="Mission" value={intake.mission || "—"} />
          <ReviewRow label="Core values" value={coreValues.length ? coreValues.join(", ") : "—"} />
          <ReviewRow label="Brand story" value={intake.brandStory || "—"} />
          <ReviewRow label="Why" value={intake.why || "—"} />
          <ReviewRow label="Legacy" value={intake.legacy || "—"} />
          <ReviewRow label="Quotables" value={intake.quotables || "—"} />
          <ReviewRow
            label="Personality"
            value={intake.personalityTraits.length ? intake.personalityTraits.join(", ") : "—"}
          />
          <ReviewRow label="Voice" value={intake.toneVoiceDescription || "—"} />
          <ReviewRow label="Interaction style" value={intake.interactionStyle || "—"} />
          <ReviewRow label="Persona" value={intake.personaType || "—"} />
          <ReviewRow label="Industry" value={intake.industry} />
          <ReviewRow label="Audience" value={intake.targetAudience} />
          <ReviewRow label="Value prop" value={intake.valueProposition || "—"} />
          <ReviewRow
            label="Products"
            value={products.length ? products.map((p) => p.name).join(", ") : "—"}
          />
          <ReviewRow
            label="Competitors"
            value={competitors.length ? competitors.map((c) => c.name).join(", ") : "—"}
          />
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
        <div className="kicker mb-2">Anything else (optional)</div>
        <textarea
          className="textarea"
          placeholder="Constraints, references, things to avoid…"
          value={intake.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </label>
    </>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ color: "var(--color-text-muted)" }}>{label}</div>
      <div style={{ whiteSpace: "pre-wrap" }}>{value || "—"}</div>
    </>
  );
}
