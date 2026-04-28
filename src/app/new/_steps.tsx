"use client";

// Shared constants + step components used by both the Quick (/new) and Deep
// (/new/deep) intake flows. The underscore prefix marks this as a private
// colocated file (not a route segment).

import { useRef, useState } from "react";
import type { BrandIntake } from "@/lib/types";

/* ---------------- Shared constants ---------------- */

export const LOGO_STYLES = [
  { key: "professional", title: "Professional", blurb: "Clean wordmark or geometric mark. Suit-and-tie." },
  { key: "playful",      title: "Playful",      blurb: "Friendly curves, bouncy proportions, expressive." },
  { key: "minimal",      title: "Minimal",      blurb: "Single line, single shape. Negative space does the work." },
  { key: "cartoonish",   title: "Cartoonish",   blurb: "Mascot, illustrative character, hand-drawn energy." },
  { key: "vintage",      title: "Vintage",      blurb: "Heritage type, badges, ornamental detail." },
  { key: "bold",         title: "Bold",         blurb: "Heavy weights, strong geometry, high contrast." },
];

export const TONE_OPTIONS = [
  "confident", "precise", "modern", "institutional", "warm", "discreet",
  "direct", "playful", "technical", "bold", "restrained", "unpretentious",
  "visionary", "grounded",
];

export const ARCHETYPES = [
  { key: "sage", title: "Sage", blurb: "Authority, depth, editorial clarity." },
  { key: "hero", title: "Hero", blurb: "Bold, decisive, a flag to rally around." },
  { key: "creator", title: "Creator", blurb: "Craft, warmth, unpretentious taste." },
  { key: "caregiver", title: "Caregiver", blurb: "Calm, clear, reliably trustworthy." },
];

export const PALETTES = [
  { key: "inkwell",   title: "Inkwell",   blurb: "Deep ink, restrained, editorial.",        swatches: ["#0f172a", "#334155", "#cbd5e1", "#f8fafc"] },
  { key: "vellum",    title: "Vellum",    blurb: "Warm paper, muted gold, print-weight.",   swatches: ["#2a2620", "#5c4a2c", "#d9b87a", "#f6f1e4"] },
  { key: "meridian",  title: "Meridian",  blurb: "Institutional navy with a single cyan.",  swatches: ["#0b3a66", "#1e5b8f", "#59c4e6", "#eef3f6"] },
  { key: "plenum",    title: "Plenum",    blurb: "Moss on paper — sage, calm.",             swatches: ["#1a1f1a", "#263e0f", "#a8b098", "#f2f0e9"] },
  { key: "graphite",  title: "Graphite",  blurb: "Near-black + electric cyan. Tech edge.",   swatches: ["#0a0a0a", "#06b6d4", "#94a3b8", "#f5f5f5"] },
  { key: "rust",      title: "Rust",      blurb: "Burnt sienna, cream, charcoal. Warm craft.", swatches: ["#9a3412", "#1f2937", "#fcd34d", "#fffbeb"] },
  { key: "oxblood",   title: "Oxblood",   blurb: "Dark red, champagne, onyx. Luxury.",       swatches: ["#7f1d1d", "#ca8a04", "#18181b", "#f5f5f4"] },
  { key: "clinic",    title: "Clinic",    blurb: "Single blue on cool whites. Healthcare-clean.", swatches: ["#0369a1", "#7dd3fc", "#e2e8f0", "#ffffff"] },
  { key: "dune",      title: "Dune",      blurb: "Sandstone, terracotta, bone. Desert warm.", swatches: ["#78350f", "#d97706", "#fde68a", "#fef3c7"] },
  { key: "cobalt",    title: "Cobalt",    blurb: "Deep cobalt, amber, ivory. Bold + modern.", swatches: ["#1e3a8a", "#f59e0b", "#fef3c7", "#ffffff"] },
  { key: "forest",    title: "Forest",    blurb: "Pine, moss, bark, cream. Heritage outdoors.", swatches: ["#14532d", "#365314", "#84cc16", "#fafaf5"] },
  { key: "orchid",    title: "Orchid",    blurb: "Plum, rose, ivory. Feminine + refined.",    swatches: ["#581c87", "#db2777", "#fbcfe8", "#fdf2f8"] },
  { key: "monolith",  title: "Monolith",  blurb: "Pure black, white, single red accent.",     swatches: ["#0a0a0a", "#dc2626", "#f5f5f5", "#737373"] },
  { key: "veridian",  title: "Veridian",  blurb: "Emerald, gold, cream. Quiet luxury.",       swatches: ["#064e3b", "#d4af37", "#fef9c3", "#fafaf9"] },
  { key: "chambray",  title: "Chambray",  blurb: "Soft denim, warm white, sienna. Approachable craft.", swatches: ["#475569", "#94a3b8", "#fb923c", "#fef3c7"] },
  { key: "amaro",     title: "Amaro",     blurb: "Espresso, cream, terracotta. Italian café.", swatches: ["#3f2e1e", "#a16207", "#fde68a", "#fef3c7"] },
  { key: "mineral",   title: "Mineral",   blurb: "Slate, copper, bone. Industrial heritage.", swatches: ["#1e293b", "#a8744a", "#cbd5e1", "#f5f5f4"] },
  { key: "cobalt-vapor", title: "Cobalt Vapor", blurb: "Electric blue gradient, off-white. SaaS modern.", swatches: ["#1d4ed8", "#3b82f6", "#a5f3fc", "#f8fafc"] },
  { key: "chalk",     title: "Chalk",     blurb: "Off-white, charcoal, single accent. Editorial mag.", swatches: ["#fafaf9", "#171717", "#dc2626", "#e7e5e4"] },
  { key: "marigold",  title: "Marigold",  blurb: "Saffron, ink, cream. Optimistic + grounded.", swatches: ["#ca8a04", "#1c1917", "#fef3c7", "#fafaf9"] },
  { key: "abalone",   title: "Abalone",   blurb: "Dusty rose, pearl, charcoal. Soft luxury.",  swatches: ["#9d8189", "#f4acb7", "#ffe5d9", "#22223b"] },
  { key: "kelp",      title: "Kelp",      blurb: "Deep teal, ochre, oat. Coastal natural.",    swatches: ["#134e4a", "#ca8a04", "#ecfccb", "#f5f5f4"] },
  { key: "noir",      title: "Noir",      blurb: "Black, mercury silver, blood red. Cinematic.", swatches: ["#0a0a0a", "#9ca3af", "#991b1b", "#1c1917"] },
  { key: "sorbet",    title: "Sorbet",    blurb: "Coral, peach, mint, cream. Playful DTC.",    swatches: ["#fb7185", "#fdba74", "#86efac", "#fff7ed"] },
  { key: "ivory-tower", title: "Ivory Tower", blurb: "Cream, navy, brass. Old-money academic.", swatches: ["#fffbeb", "#1e3a8a", "#a16207", "#292524"] },
  { key: "matcha",    title: "Matcha",    blurb: "Sage, cream, terracotta. Wellness modern.",  swatches: ["#65a30d", "#fef3c7", "#c2410c", "#fafaf9"] },
  { key: "tide",      title: "Tide",      blurb: "Seafoam, navy, coral. Yacht club refresh.",  swatches: ["#0e7490", "#0c4a6e", "#fb7185", "#f0f9ff"] },
  { key: "umber",     title: "Umber",     blurb: "Burnt umber, cream, gold. Heritage finance.", swatches: ["#451a03", "#a16207", "#fef3c7", "#fafaf9"] },
  { key: "cosmos",    title: "Cosmos",    blurb: "Midnight purple, magenta, silver. Futurist.", swatches: ["#1e1b4b", "#c026d3", "#cbd5e1", "#0c0a09"] },
  { key: "shoreline", title: "Shoreline", blurb: "Pale blue, sand, coral. Approachable wellness.", swatches: ["#7dd3fc", "#fde68a", "#fb7185", "#f8fafc"] },
];

export const AI_PICKS_PALETTE = "AI · Choose for me";

/** Expand the user's palette pick into a hex-carrying string so the skill knows
 *  the exact colors. AI-picks gets sent as empty string. */
export function expandPaletteForSubmit(intake: BrandIntake): BrandIntake {
  const picked = PALETTES.find((p) => p.title === intake.palettePreference);
  if (picked) {
    return { ...intake, palettePreference: `${picked.title} — ${picked.swatches.join(", ")}` };
  }
  if (intake.palettePreference === AI_PICKS_PALETTE) {
    return { ...intake, palettePreference: "" };
  }
  return intake;
}

/* ---------------- Shared step components ---------------- */

export function ToneStep({
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

export function ArchetypeStep({
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

export function PaletteStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  const aiOn = intake.palettePreference === AI_PICKS_PALETTE;
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        Pick a palette — or let the AI choose.
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "58ch" }}>
        Pulled from your archetype{intake.archetype ? ` (${intake.archetype})` : ""} and industry. Pick one, or let the AI choose colors based on color theory and your brand personality.
      </p>

      {/* AI-picks-colors option, top of the list */}
      <button
        type="button"
        onClick={() => onChange({ palettePreference: AI_PICKS_PALETTE })}
        className={`card card-hover p-5 text-left mb-4 w-full ${aiOn ? "ring-2" : ""}`}
        style={
          aiOn
            ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
            : undefined
        }
      >
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium tracking-tight">Let the AI choose</div>
          <input type="radio" name="palette" checked={aiOn} onChange={() => onChange({ palettePreference: AI_PICKS_PALETTE })} />
        </div>
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Color theory + your brand&apos;s personality, audience, and industry. Best when you don&apos;t have a strong existing visual identity.
        </div>
      </button>

      <div className="kicker mb-3">Or pick from {PALETTES.length}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

export function LogoStyleStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What kind of logo are you after?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Pick a style direction. We&apos;ll generate options to match. Skip if you have no preference and we&apos;ll choose based on your brand.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {LOGO_STYLES.map((s) => {
          const on = intake.logoStyle === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange({ logoStyle: on ? "" : s.key })}
              className={`card card-hover p-4 text-left ${on ? "ring-2" : ""}`}
              style={
                on
                  ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
                  : undefined
              }
            >
              <div className="font-medium tracking-tight mb-1">{s.title}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {s.blurb}
              </div>
            </button>
          );
        })}
      </div>
      <label className="block">
        <div className="kicker mb-2">Inspiration links (optional)</div>
        <textarea
          className="textarea"
          rows={3}
          placeholder="Paste Pinterest, Dribbble, or other URLs — one per line. We'll use these as visual references."
          value={intake.logoInspirationUrls}
          onChange={(e) => onChange({ logoInspirationUrls: e.target.value })}
        />
        <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
          Optional. Helps the model match the vibe you&apos;re after.
        </p>
      </label>
    </>
  );
}

export function LogoStep({
  intake,
  onChange,
}: {
  intake: BrandIntake;
  onChange: (p: Partial<BrandIntake>) => void;
}) {
  // Track the chosen mode explicitly — having an uploadedLogoPath implies
  // upload-mode, but the user can be in upload-mode BEFORE they've actually
  // picked a file (otherwise the chicken-and-egg: we need the hidden input
  // to exist to trigger the file picker, but we were only rendering it
  // after the state flip).
  const [mode, setMode] = useState<"create" | "upload">(
    intake.uploadedLogoPath ? "upload" : "create"
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickCreate() {
    setMode("create");
    onChange({ uploadedLogoPath: "" });
  }
  function pickUpload() {
    setMode("upload");
    setTimeout(() => fileRef.current?.click(), 0);
  }

  async function uploadLogo(file: File) {
    setUploading(true);
    setError(null);
    const form = new FormData();
    form.append("files", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setUploading(false);
      return;
    }
    const data = (await res.json()) as {
      sessionId: string;
      uploaded: { filename: string; url: string }[];
    };
    const first = data.uploaded[0];
    if (first) onChange({ uploadedLogoPath: first.url });
    setUploading(false);
  }

  return (
    <>
      <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 44 }}>
        What about the logo?
      </h1>
      <p className="text-base mb-6" style={{ color: "var(--color-text-muted)", maxWidth: "54ch" }}>
        We can design 3 distinct options for you to pick from — or if you already have one you love, upload it and we&apos;ll build the rest of the brand around it.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <button
          type="button"
          onClick={pickCreate}
          className={`card card-hover p-5 text-left ${mode === "create" ? "ring-2" : ""}`}
          style={
            mode === "create"
              ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
              : undefined
          }
        >
          <div className="font-medium tracking-tight mb-1">Create 3 options for me</div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Wordmark, monogram, and a geometric mark. Pick your favorite after.
          </div>
        </button>
        <button
          type="button"
          onClick={pickUpload}
          className={`card card-hover p-5 text-left ${mode === "upload" ? "ring-2" : ""}`}
          style={
            mode === "upload"
              ? { borderColor: "var(--color-primary)", boxShadow: "var(--sh-focus)" }
              : undefined
          }
        >
          <div className="font-medium tracking-tight mb-1">I already have one</div>
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Upload SVG or PNG. We&apos;ll build the rest of the brand system around it.
          </div>
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/svg+xml,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) void uploadLogo(e.target.files[0]);
          e.target.value = "";
        }}
      />

      {mode === "upload" && (
        <div
          className="p-6 text-center transition cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) void uploadLogo(e.dataTransfer.files[0]);
          }}
          style={{
            border: `1.5px dashed ${dragOver ? "var(--color-primary)" : "var(--color-border)"}`,
            borderRadius: "var(--r-lg)",
            background: dragOver ? "var(--color-surface-2)" : "var(--color-surface)",
          }}
        >
          {intake.uploadedLogoPath ? (
            <div className="flex items-center justify-center gap-4">
              <object
                data={intake.uploadedLogoPath}
                type="image/svg+xml"
                aria-label="Uploaded logo"
                style={{ maxHeight: 80, maxWidth: 240, pointerEvents: "none" }}
              />
              <div className="text-left">
                <div className="font-medium text-sm">Logo uploaded</div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Click to replace.
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium">
                {uploading ? "Uploading…" : "Drop your logo here or click to browse"}
              </div>
              <div className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                SVG, PNG, JPG · up to 20 MB
              </div>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-status-failed)" }}>
          {error}
        </p>
      )}
    </>
  );
}
