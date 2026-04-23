"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandIntake } from "@/lib/types";

type StepKey = "company" | "audience" | "tone" | "archetype" | "palette" | "review";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "company", label: "Company" },
  { key: "audience", label: "Audience" },
  { key: "tone", label: "Tone" },
  { key: "archetype", label: "Archetype" },
  { key: "palette", label: "Palette" },
  { key: "review", label: "Review" },
];

const TONE_OPTIONS = [
  "confident", "precise", "modern", "institutional", "warm", "discreet",
  "direct", "playful", "technical", "bold", "restrained", "unpretentious",
  "visionary", "grounded",
];

const ARCHETYPES = [
  { key: "sage", title: "Sage", blurb: "Authority, depth, editorial clarity." },
  { key: "hero", title: "Hero", blurb: "Bold, decisive, a flag to rally around." },
  { key: "creator", title: "Creator", blurb: "Craft, warmth, unpretentious taste." },
  { key: "caregiver", title: "Caregiver", blurb: "Calm, clear, reliably trustworthy." },
];

const PALETTES = [
  { key: "inkwell",  title: "Inkwell",  blurb: "Deep ink, restrained, editorial.",       swatches: ["#0f172a", "#334155", "#cbd5e1", "#f8fafc"] },
  { key: "vellum",   title: "Vellum",   blurb: "Warm paper, muted gold, print-weight.", swatches: ["#2a2620", "#5c4a2c", "#d9b87a", "#f6f1e4"] },
  { key: "meridian", title: "Meridian", blurb: "Institutional navy with a single cyan.", swatches: ["#0b3a66", "#1e5b8f", "#59c4e6", "#eef3f6"] },
  { key: "plenum",   title: "Plenum",   blurb: "Moss on paper — sage, calm.",           swatches: ["#1a1f1a", "#263e0f", "#a8b098", "#f2f0e9"] },
];

const EMPTY: BrandIntake = {
  companyName: "",
  industry: "",
  targetAudience: "",
  toneOfVoice: "",
  competitors: "",
  archetype: "",
  palettePreference: "",
  notes: "",
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
      case "audience":  return intake.industry.trim().length > 0 && intake.targetAudience.trim().length > 0;
      case "tone":      return intake.toneOfVoice.split(",").map((s) => s.trim()).filter(Boolean).length >= 1;
      case "archetype": return intake.archetype.trim().length > 0;
      case "palette":   return intake.palettePreference.trim().length > 0;
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
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
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

/* ---------------- Steps ---------------- */

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
        Let&apos;s start with the basics. What&apos;s the company called?
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

function ToneStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const selected = intake.toneOfVoice.split(",").map((s) => s.trim()).filter(Boolean);
  const toggle = (word: string) => {
    const exists = selected.includes(word);
    const next = exists ? selected.filter((w) => w !== word) : [...selected, word];
    onChange({ toneOfVoice: next.join(", ") });
  };
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        How should your brand <em style={{ fontStyle: "italic" }}>sound?</em>
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Pick 3–5 that feel right — leave the rest.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {TONE_OPTIONS.map((word) => {
          const isOn = selected.includes(word);
          return (
            <button
              key={word}
              type="button"
              className={`pill ${isOn ? "pill-selected" : ""}`}
              onClick={() => toggle(word)}
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
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {selected.length} selected.
      </p>
    </>
  );
}

function ArchetypeStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What shape should the brand take?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Archetypes give the skill a baseline personality to design against.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ARCHETYPES.map((a) => {
          const on = intake.archetype === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => onChange({ archetype: a.key })}
              className={`card card-hover p-4 text-left ${on ? "ring-2" : ""}`}
              style={
                on
                  ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
                  : undefined
              }
            >
              <div className="font-medium tracking-tight mb-1">{a.title}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {a.blurb}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function PaletteStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Here are four directions your palette could take.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "58ch" }}>
        Pulled from your archetype{intake.archetype ? ` (${intake.archetype})` : ""} and industry. Pick one, or skip.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PALETTES.map((p) => {
          const on = intake.palettePreference === p.title;
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onChange({ palettePreference: p.title })}
              className={`card card-hover p-4 text-left ${on ? "ring-2" : ""}`}
              style={
                on
                  ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
                  : undefined
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium tracking-tight">{p.title}</div>
                <input
                  type="radio"
                  name="palette"
                  checked={on}
                  onChange={() => onChange({ palettePreference: p.title })}
                />
              </div>
              <div className="flex gap-1.5 mb-3">
                {p.swatches.map((hex) => (
                  <span
                    key={hex}
                    className="flex-1 rounded"
                    style={{
                      height: 48,
                      background: hex,
                      border: "1px solid rgba(0,0,0,.06)",
                    }}
                  />
                ))}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {p.blurb}
              </div>
            </button>
          );
        })}
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
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        A last look before we build.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "52ch" }}>
        Add anything else the skill should consider. This takes a few minutes to run.
      </p>
      <div className="card p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-y-3 gap-x-6 text-sm">
          <ReviewRow label="Company" value={intake.companyName} />
          <ReviewRow label="Industry" value={intake.industry} />
          <ReviewRow label="Audience" value={intake.targetAudience} />
          <ReviewRow label="Tone" value={intake.toneOfVoice || "—"} />
          <ReviewRow label="Archetype" value={intake.archetype || "—"} />
          <ReviewRow label="Palette" value={intake.palettePreference || "—"} />
        </div>
      </div>
      <label className="block mb-4">
        <div className="kicker mb-2">Competitors (optional)</div>
        <input
          className="input"
          placeholder="e.g. Hebbia, Harvey"
          value={intake.competitors}
          onChange={(e) => onChange({ competitors: e.target.value })}
        />
      </label>
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
      <div>{value || "—"}</div>
    </>
  );
}
