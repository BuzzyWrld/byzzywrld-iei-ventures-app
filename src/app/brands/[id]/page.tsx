"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { BrandProject } from "@/lib/types";
import { DeleteBrandButton } from "@/components/DeleteBrandButton";
import { SendToCanvaButton } from "@/components/SendToCanvaButton";

// The real skill produces a richer brand.json than our minimal BrandJson
// type. Fields are 'unknown' so we coerce safely at render-time — different
// providers (Claude, DeepSeek, Kimi) structure this differently, and we
// refuse to crash on any of them.
type LiveBrandJson = {
  name?: unknown;
  tagline?: unknown;
  positioning?: unknown;
  tone?: unknown;
  colors?: unknown;
  typography?: unknown;
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getUTCDate()}, ${d.getFullYear()}`;
}

/** Coerce any value into a safe display string. Handles strings directly,
 *  pulls `.family`/`.name` from objects, arrays get joined. Never returns
 *  an object so React can always render the result. */
function asText(v: unknown, fallback = "—"): string {
  if (v == null) return fallback;
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return v.map((x) => asText(x, "")).filter(Boolean).join(", ") || fallback;
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    for (const key of ["family", "name", "value", "label", "text"]) {
      if (typeof o[key] === "string") return o[key] as string;
    }
    return fallback;
  }
  return fallback;
}

function fontName(v: unknown): string {
  return asText(v, "—");
}

/** Extract positioning as a paragraph-sized string. Different providers
 *  structure this differently: sometimes a plain string, sometimes an
 *  object with essence/mission/vision nested. */
function extractPositioning(brand: LiveBrandJson | null): string | null {
  if (!brand) return null;
  const p = brand.positioning;
  if (typeof p === "string" && p.trim()) return p;
  if (p && typeof p === "object") {
    const o = p as Record<string, unknown>;
    // Prefer the single best line available.
    const candidate =
      (typeof o.statement === "string" && o.statement) ||
      (typeof o.summary === "string" && o.summary) ||
      (typeof o.essence === "string" && o.essence) ||
      (typeof o.mission === "string" && o.mission) ||
      (typeof o.usp === "string" && o.usp) ||
      null;
    if (candidate) return candidate;
  }
  // Fall back to tagline if positioning is unusable.
  const t = brand.tagline;
  if (typeof t === "string" && t.trim()) return t;
  return null;
}

function extractTone(brand: LiveBrandJson | null): string[] {
  if (!brand?.tone) return [];
  if (Array.isArray(brand.tone)) {
    return brand.tone.map((t) => asText(t, "")).filter(Boolean);
  }
  if (typeof brand.tone === "string") {
    return brand.tone.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function extractColors(brand: LiveBrandJson | null): Record<string, string> | null {
  const c = brand?.colors;
  if (!c || typeof c !== "object") return null;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(c as Record<string, unknown>)) {
    if (typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v)) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

function extractTypography(
  brand: LiveBrandJson | null
): { heading: string; body: string } {
  const t = (brand?.typography ?? {}) as Record<string, unknown>;
  return {
    heading: fontName(t.heading),
    body: fontName(t.body),
  };
}

/** Pick out swatches to render as the primary palette row.
 *  Real brand.json has many color keys; we show up to 4 with a primary bias. */
function pickPalette(colors: Record<string, string> | undefined): Array<{ key: string; hex: string }> {
  if (!colors) return [];
  const priority = ["primary", "secondary", "accent", "background", "neutral", "surface", "text"];
  const picked: Array<{ key: string; hex: string }> = [];
  for (const key of priority) {
    if (colors[key] && /^#[0-9a-f]{3,8}$/i.test(colors[key])) {
      picked.push({ key, hex: colors[key] });
    }
    if (picked.length >= 4) break;
  }
  // Fill in from other hex-valued keys if we don't have 4 yet.
  if (picked.length < 4) {
    for (const [key, hex] of Object.entries(colors)) {
      if (picked.find((p) => p.key === key)) continue;
      if (typeof hex === "string" && /^#[0-9a-f]{3,8}$/i.test(hex)) {
        picked.push({ key, hex });
      }
      if (picked.length >= 4) break;
    }
  }
  return picked;
}

export default function BrandProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<BrandProject | null>(null);
  const [brand, setBrand] = useState<LiveBrandJson | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Poll project until it reaches a terminal state.
  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    async function tick() {
      try {
        const res = await fetch(`/api/brands/${id}`);
        if (!res.ok) {
          setFetchError(`HTTP ${res.status}`);
          return;
        }
        const { project } = (await res.json()) as { project: BrandProject };
        if (cancelled) return;
        setProject(project);
        if (project.status === "pending" || project.status === "running") {
          timer = setTimeout(tick, 1500);
        }
      } catch (err) {
        if (!cancelled) setFetchError(err instanceof Error ? err.message : String(err));
      }
    }
    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [id]);

  // Once complete, fetch brand.json for the design panel.
  useEffect(() => {
    if (project?.status !== "complete" || !project.outputs.brandJson) return;
    let cancelled = false;
    fetch(project.outputs.brandJson)
      .then((r) => r.json())
      .then((b: LiveBrandJson) => {
        if (!cancelled) setBrand(b);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [project?.status, project?.outputs.brandJson]);

  if (fetchError) return <p>Error: {fetchError}</p>;
  if (!project) return <LoadingShell />;

  return (
    <>
      <Header project={project} />
      {project.status === "failed" && <FailedPanel project={project} />}
      {(project.status === "pending" || project.status === "running") && (
        <RunningPanel project={project} />
      )}
      {project.status === "complete" && <CompletePanel project={project} brand={brand} />}
    </>
  );
}

/* ---------- layout chrome ---------- */

function Header({ project }: { project: BrandProject }) {
  const badgeClass = `badge badge-${project.status}`;
  const badgeLabel = project.status[0].toUpperCase() + project.status.slice(1);
  return (
    <div
      className="flex flex-wrap items-start justify-between gap-4 mb-10 pb-8 border-b"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-3">
          <span className={badgeClass}>{badgeLabel}</span>
          <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
            ID {project.id.slice(0, 8)} · {fmtDate(project.createdAt)}
          </span>
        </div>
        <h1 className="font-serif leading-[1] mb-2" style={{ fontSize: 72 }}>
          {project.intake.companyName}
        </h1>
        <div className="text-base" style={{ color: "var(--color-text-muted)" }}>
          {project.intake.industry}
          {project.intake.targetAudience ? ` · ${project.intake.targetAudience}` : ""}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {project.status === "complete" && (
          <a
            href={`/api/brands/${project.id}/download`}
            className="btn btn-primary btn-sm"
            download
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 1v8M3 6l4 4 4-4M2 12h10" />
            </svg>
            Download all
          </a>
        )}
        <DeleteBrandButton
          brandId={project.id}
          brandName={project.intake.companyName}
          variant="text"
        />
      </div>
    </div>
  );
}

/* ---------- states ---------- */

function LoadingShell() {
  return (
    <div className="py-16">
      <span className="sk" style={{ width: "40%", height: 40, marginBottom: 16 }} />
      <span className="sk" style={{ width: "60%", height: 24 }} />
    </div>
  );
}

function RunningPanel({ project }: { project: BrandProject }) {
  const pct = Math.round((project.progressPct ?? 0) * 100);
  const stages = computeStages(project);
  return (
    <>
      <div className="card p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="spinner" style={{ color: "var(--color-status-running)" }} />
          <div className="font-medium">Building your brand…</div>
          <div
            className="ml-auto font-mono text-xs"
            style={{ color: "var(--color-text-muted)" }}
          >
            {pct}%
          </div>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden mb-4"
          style={{ background: "var(--color-surface-2)" }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background: "var(--color-status-running)",
              transition: "width 600ms ease",
            }}
          />
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {project.progressStage ?? "starting"}
          </div>
          <div
            className="font-mono text-xs shrink-0"
            style={{ color: "var(--color-text-muted)" }}
          >
            Usually takes 2–3 minutes
          </div>
        </div>
      </div>

      <div className="kicker mb-3">Generating</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {stages.map((s) => (
          <StageCard key={s.key} stage={s} />
        ))}
      </div>
    </>
  );
}

type StageState = "pending" | "running" | "complete";
type Stage = {
  key: string;
  title: string;
  blurb: string;
  state: StageState;
};

function computeStages(project: BrandProject): Stage[] {
  const o = project.outputs;
  const projectRunning = project.status === "running" || project.status === "pending";
  const brandFoundationDone = Boolean(o.brandJson);
  const userUploadedLogo = Boolean(project.intake.uploadedLogoPath);
  const logosDone = userUploadedLogo
    ? Boolean(o.logoSvg)
    : Boolean(o.logoVariants && o.logoVariants.length > 0);

  function stateOf(done: boolean, runsAfterFoundation = true): StageState {
    if (done) return "complete";
    // If it's a "fires after foundation" stage and the foundation isn't done
    // yet, it's still pending (not yet started).
    if (runsAfterFoundation && !brandFoundationDone) return "pending";
    return projectRunning ? "running" : "pending";
  }

  return [
    {
      key: "foundation",
      title: "Brand foundation",
      blurb: "Positioning, tone, typography",
      state: stateOf(brandFoundationDone, false),
    },
    {
      key: "logos",
      title: userUploadedLogo ? "Your logo" : "Logos",
      blurb: userUploadedLogo ? "Copying into brand kit" : "3 distinct directions",
      state: stateOf(logosDone),
    },
    {
      key: "palette",
      title: "Color system",
      blurb: "Tints, shades, semantic tokens",
      state: stateOf(Boolean(o.paletteExpansion)),
    },
    {
      key: "landing",
      title: "Landing pages",
      blurb: "3 layout directions",
      state: stateOf(Boolean(o.landingVariants && o.landingVariants.length > 0)),
    },
    {
      key: "social",
      title: "Social kit",
      blurb: "Post, covers, avatar",
      state: stateOf(Boolean(o.socialKit && o.socialKit.length > 0)),
    },
    {
      key: "pitch-email",
      title: "Pitch & email",
      blurb: "One-pager + signature",
      state: stateOf(Boolean(o.pitchOnePager || o.emailKit)),
    },
    {
      key: "dev-brief",
      title: "Developer brief",
      blurb: "Handoff for the website builder",
      state: stateOf(Boolean(o.devBrief)),
    },
  ];
}

function StageCard({ stage }: { stage: Stage }) {
  const { state } = stage;
  const border =
    state === "complete"
      ? "var(--color-status-complete)"
      : state === "running"
      ? "var(--color-status-running)"
      : "var(--color-border)";
  const titleColor =
    state === "pending" ? "var(--color-text-muted)" : "var(--color-text)";
  return (
    <div
      className="card p-4 flex items-start gap-3 transition"
      style={{ borderColor: border }}
    >
      <StageIcon state={state} />
      <div className="min-w-0 flex-1">
        <div
          className="font-medium tracking-tight text-sm"
          style={{ color: titleColor }}
        >
          {stage.title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
          {state === "complete"
            ? "Done"
            : state === "running"
            ? "Working…"
            : stage.blurb}
        </div>
      </div>
    </div>
  );
}

function StageIcon({ state }: { state: StageState }) {
  const size = 22;
  if (state === "complete") {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0 rounded-full"
        style={{
          width: size,
          height: size,
          background: "var(--color-status-complete)",
          color: "#fff",
        }}
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7.5l3 3L11 4.5" />
        </svg>
      </span>
    );
  }
  if (state === "running") {
    return (
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ width: size, height: size, color: "var(--color-status-running)" }}
      >
        <span className="spinner" style={{ width: 14, height: 14 }} />
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        border: "1.5px solid var(--color-border)",
        background: "var(--color-surface)",
      }}
    />
  );
}

function FailedPanel({ project }: { project: BrandProject }) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  async function retry() {
    setRetrying(true);
    setRetryError(null);
    const res = await fetch(`/api/brands/${project.id}/retry`, { method: "POST" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setRetryError(body.error ?? `HTTP ${res.status}`);
      setRetrying(false);
      return;
    }
    // The brand is now back in 'pending'. Reload the page so the polling
    // loop picks up the new status.
    window.location.reload();
  }

  return (
    <div className="card p-6 md:p-8" style={{ borderColor: "var(--color-status-failed)" }}>
      <div className="flex items-start gap-3 mb-4">
        <svg
          className="mt-0.5 shrink-0"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--color-status-failed)" }}
        >
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v5M10 13.5h.01" />
        </svg>
        <div>
          <h2 className="text-lg font-medium mb-1">The skill didn&apos;t finish</h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {project.error ??
              "Unknown error. Your intake is saved — click Retry to try again without re-entering anything."}
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--color-text-muted)" }}>
            Your intake is saved. No need to fill out the questionnaire again.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn btn-primary"
          onClick={retry}
          disabled={retrying}
        >
          {retrying ? (
            <>
              <span className="spinner" /> Retrying…
            </>
          ) : (
            "Retry with saved intake"
          )}
        </button>
        <Link href="/new" className="btn btn-ghost">
          Start a different brand
        </Link>
      </div>
      {retryError && (
        <p className="mt-3 text-sm" style={{ color: "var(--color-status-failed)" }}>
          {retryError}
        </p>
      )}
    </div>
  );
}

function CompletePanel({
  project,
  brand,
}: {
  project: BrandProject;
  brand: LiveBrandJson | null;
}) {
  const variants = project.outputs.logoVariants ?? [];
  const primaryPicked = Boolean(project.outputs.primaryLogoKey);
  const needsLogoPick = variants.length > 0 && !primaryPicked;

  // Gate the rest of the brand kit behind the logo pick. The user sees
  // three large logo options, picks one, and only then does the rest of
  // the brand (palette, typography, landing pages, etc.) reveal. This
  // matches the intent: the logo is the lead decision.
  if (needsLogoPick) {
    return <LogoPickerGate project={project} />;
  }

  // Imported-brand flow puts 'Scraped from' at the top of intake.notes.
  // Those users arrived WITH an existing brand kit — they want to see the
  // AI-harmonized palette/typography first, then explore alternate logos.
  // Scratch users are creating from nothing — the logo is the payoff moment.
  const isImported =
    typeof project.intake.notes === "string" &&
    project.intake.notes.startsWith("Scraped from");

  if (isImported) {
    return (
      <>
        <Positioning brand={brand} />
        <Palette brand={brand} />
        <PaletteExpansion project={project} />
        <Typography brand={brand} />
        <LogoOptions project={project} />
        <LandingOptions project={project} />
        <SocialKit project={project} />
        <PitchOnePager project={project} />
        <EmailKit project={project} />
        <DevBrief project={project} />
        <Downloads project={project} />
      </>
    );
  }

  // Scratch flow: logos first — that's the moment that sells the product.
  return (
    <>
      <Positioning brand={brand} />
      <LogoOptions project={project} />
      <Palette brand={brand} />
      <Typography brand={brand} />
      <PaletteExpansion project={project} />
      <LandingOptions project={project} />
      <SocialKit project={project} />
      <PitchOnePager project={project} />
      <EmailKit project={project} />
      <Downloads project={project} />
    </>
  );
}

function PaletteExpansion({ project }: { project: BrandProject }) {
  const pal = project.outputs.paletteExpansion;
  if (!pal) return null;
  const lightKeys = Object.keys(pal.light);
  const semanticKeys = Object.keys(pal.semantic);
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">02 · Expanded palette</div>
          <h2 className="text-2xl font-medium tracking-tight">Full design system colors</h2>
        </div>
        <a href={pal.url} download className="btn btn-ghost btn-sm">
          Download JSON
        </a>
      </div>
      {lightKeys.length > 0 && (
        <>
          <div className="kicker mb-2">Light</div>
          <div
            className="flex flex-wrap gap-1 mb-6"
            style={{ maxWidth: "100%" }}
          >
            {lightKeys.map((k) => (
              <SwatchChip key={k} label={k} hex={pal.light[k]} />
            ))}
          </div>
        </>
      )}
      {semanticKeys.length > 0 && (
        <>
          <div className="kicker mb-2">Semantic</div>
          <div className="flex flex-wrap gap-1">
            {semanticKeys.map((k) => (
              <SwatchChip key={k} label={k} hex={pal.semantic[k]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SwatchChip({ label, hex }: { label: string; hex: string }) {
  const textOnHex = isHexDark(hex) ? "#fff" : "#111";
  return (
    <div
      title={`${label} · ${hex}`}
      className="flex items-center gap-1.5 rounded font-mono"
      style={{
        padding: "4px 8px",
        fontSize: 10,
        background: hex,
        color: textOnHex,
        border: "1px solid rgba(0,0,0,.08)",
      }}
    >
      <span>{label}</span>
      <span style={{ opacity: 0.7 }}>{hex}</span>
    </div>
  );
}

function isHexDark(hex: string): boolean {
  const m = hex.replace("#", "").slice(0, 6);
  if (m.length < 6) return false;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  // Perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}

function LandingOptions({ project }: { project: BrandProject }) {
  const variants = project.outputs.landingVariants ?? [];
  if (variants.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">05 · Landing page options</div>
          <h2 className="text-2xl font-medium tracking-tight">Three layouts</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {variants.map((v) => (
          <div key={v.key} className="card overflow-hidden flex flex-col">
            <div
              className="relative"
              style={{ aspectRatio: "4 / 3", background: "var(--color-surface-2)" }}
            >
              <iframe
                src={v.url}
                title={v.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "250%",
                  height: "250%",
                  transform: "scale(0.4)",
                  transformOrigin: "top left",
                  border: 0,
                  pointerEvents: "none",
                }}
              />
            </div>
            <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <div className="font-medium tracking-tight">{v.title}</div>
                <div className="flex gap-2">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] hover:underline"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Open ↗
                  </a>
                  <a
                    href={v.url}
                    download
                    className="font-mono text-[11px] hover:underline"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Download
                  </a>
                </div>
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {v.rationale}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SocialKit({ project }: { project: BrandProject }) {
  const assets = project.outputs.socialKit ?? [];
  if (assets.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">06 · Social kit</div>
          <h2 className="text-2xl font-medium tracking-tight">Branded assets</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {assets.map((a) => (
          <div key={a.key} className="card overflow-hidden flex flex-col">
            <div
              className="flex items-center justify-center p-3"
              style={{
                aspectRatio: "1 / 1",
                background: "var(--color-surface-2)",
              }}
            >
              <object
                data={a.url}
                type="image/svg+xml"
                aria-label={a.title}
                style={{ maxWidth: "100%", maxHeight: "100%", pointerEvents: "none" }}
              />
            </div>
            <div className="p-3 border-t" style={{ borderColor: "var(--color-border)" }}>
              <div className="font-medium text-sm tracking-tight truncate">{a.title}</div>
              <div className="flex items-baseline justify-between gap-2 mt-0.5">
                <div
                  className="font-mono text-[10px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {a.platform} · {a.size}
                </div>
                <a
                  href={a.url}
                  download
                  className="font-mono text-[10px] hover:underline"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchOnePagerSection({ project }: { project: BrandProject }) {
  const p = project.outputs.pitchOnePager;
  if (!p) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">07 · Pitch one-pager</div>
          <h2 className="text-2xl font-medium tracking-tight">Brand snapshot</h2>
        </div>
        <div className="flex gap-2">
          <a href={p.htmlUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Open HTML
          </a>
          {p.pdfUrl && (
            <a href={p.pdfUrl} download className="btn btn-secondary btn-sm">
              Download PDF
            </a>
          )}
        </div>
      </div>
      <div
        className="card overflow-hidden"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <iframe
          src={p.htmlUrl}
          title="Pitch one-pager"
          style={{
            width: "100%",
            aspectRatio: "850 / 1100",
            border: 0,
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

function PitchOnePager({ project }: { project: BrandProject }) {
  return <PitchOnePagerSection project={project} />;
}

function DevBrief({ project }: { project: BrandProject }) {
  const d = project.outputs.devBrief;
  if (!d) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">09 · Developer brief</div>
          <h2 className="text-2xl font-medium tracking-tight">Handoff for the website builder</h2>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)", maxWidth: "60ch" }}>
            Color tokens, typography, component specs, site map, content sources, tech notes. Hand this to whoever builds the site.
          </p>
        </div>
        <div className="flex gap-2">
          <a href={d.htmlUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
            Open HTML
          </a>
          {d.pdfUrl && (
            <a href={d.pdfUrl} download className="btn btn-secondary btn-sm">
              Download PDF
            </a>
          )}
        </div>
      </div>
      <div
        className="card overflow-hidden"
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        <iframe
          src={d.htmlUrl}
          title="Developer brief"
          style={{
            width: "100%",
            aspectRatio: "850 / 1100",
            border: 0,
            display: "block",
          }}
        />
      </div>
    </div>
  );
}

function EmailKit({ project }: { project: BrandProject }) {
  const e = project.outputs.emailKit;
  if (!e || (!e.headerUrl && !e.signatureUrl)) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">08 · Email kit</div>
          <h2 className="text-2xl font-medium tracking-tight">Header + signature</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {e.headerUrl && (
          <div className="card overflow-hidden">
            <div
              className="flex items-center justify-center p-6"
              style={{ background: "var(--color-surface-2)", minHeight: 160 }}
            >
              <object
                data={e.headerUrl}
                type="image/svg+xml"
                aria-label="Email header"
                style={{ maxWidth: "100%", maxHeight: 120, pointerEvents: "none" }}
              />
            </div>
            <div className="p-4 border-t flex items-baseline justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <div className="font-medium">Email header</div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  600×120 · SVG · drop into mailer headers
                </div>
              </div>
              <a
                href={e.headerUrl}
                download
                className="font-mono text-[11px] hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Download
              </a>
            </div>
          </div>
        )}
        {e.signatureUrl && (
          <div className="card overflow-hidden">
            <div
              className="flex items-center justify-center p-6"
              style={{ background: "var(--color-surface-2)", minHeight: 160 }}
            >
              <iframe
                src={e.signatureUrl}
                title="Email signature"
                style={{ width: "100%", height: 140, border: 0 }}
              />
            </div>
            <div className="p-4 border-t flex items-baseline justify-between" style={{ borderColor: "var(--color-border)" }}>
              <div>
                <div className="font-medium">Email signature</div>
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  HTML table · paste into Gmail signature settings
                </div>
              </div>
              <a
                href={e.signatureUrl}
                download
                className="font-mono text-[11px] hover:underline"
                style={{ color: "var(--color-text-muted)" }}
              >
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LogoPickerGate({ project }: { project: BrandProject }) {
  const variants = project.outputs.logoVariants ?? [];
  const [picking, setPicking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pick(key: string) {
    setPicking(key);
    setError(null);
    const res = await fetch(`/api/brands/${project.id}/primary-logo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setPicking(null);
      return;
    }
    // Reload so the rest of the brand kit reveals.
    window.location.reload();
  }

  return (
    <div className="mb-12">
      <div className="kicker mb-3">Pick your logo to continue</div>
      <h2
        className="font-serif mb-3"
        style={{ fontSize: 32, lineHeight: 1.15 }}
      >
        Three directions. Pick one and we&apos;ll build the rest of your brand around it.
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)", maxWidth: "56ch" }}>
        Each uses a different conceptual approach. You can always download the alternatives later.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {variants.map((v) => {
          const isPicking = picking === v.key;
          const otherPicking = picking !== null && picking !== v.key;
          return (
            <div
              key={v.key}
              className="card overflow-hidden flex flex-col"
              style={otherPicking ? { opacity: 0.5 } : undefined}
            >
              <div
                className="flex items-center justify-center p-10"
                style={{ minHeight: 220, background: "var(--color-surface-2)" }}
              >
                <object
                  data={v.url}
                  type="image/svg+xml"
                  aria-label={v.title}
                  style={{ maxWidth: "100%", maxHeight: 180, pointerEvents: "none" }}
                />
              </div>
              <div
                className="p-5 border-t flex flex-col flex-1"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="font-medium tracking-tight mb-1">{v.title}</div>
                <div
                  className="text-xs mb-4 flex-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {v.rationale}
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => pick(v.key)}
                  disabled={picking !== null}
                >
                  {isPicking ? (
                    <>
                      <span className="spinner" /> Picking…
                    </>
                  ) : (
                    "Use this logo"
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-status-failed)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

function LogoOptions({ project }: { project: BrandProject }) {
  const variants = project.outputs.logoVariants ?? [];
  if (variants.length === 0) return null;
  const primaryKey = project.outputs.primaryLogoKey;
  const primary = variants.find((v) => v.key === primaryKey);
  const others = variants.filter((v) => v.key !== primaryKey);

  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">04 · Your logo</div>
          <h2 className="text-2xl font-medium tracking-tight">
            {primary ? primary.title : "Three directions"}
          </h2>
        </div>
      </div>

      {/* Primary logo — large feature card */}
      {primary && (
        <div className="card overflow-hidden mb-6">
          <div
            className="flex items-center justify-center p-12"
            style={{ minHeight: 260, background: "var(--color-surface-2)" }}
          >
            <object
              data={primary.url}
              type="image/svg+xml"
              aria-label={primary.title}
              style={{ maxWidth: "100%", maxHeight: 180, pointerEvents: "none" }}
            />
          </div>
          <div
            className="p-5 border-t flex items-start justify-between gap-4 flex-wrap"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div>
              <div className="font-medium tracking-tight mb-1">{primary.title}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)", maxWidth: "60ch" }}>
                {primary.rationale}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SendToCanvaButton logoUrl={primary.url} />
              <a href={primary.url} download className="btn btn-secondary btn-sm">
                Download SVG
              </a>
            </div>
          </div>
        </div>
      )}

      {others.length > 0 && (
        <>
          <div className="kicker mb-3">Alternatives</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {others.map((v) => (
              <AlternativeLogoCard key={v.key} project={project} variant={v} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AlternativeLogoCard({
  project,
  variant,
}: {
  project: BrandProject;
  variant: { key: string; title: string; rationale: string; url: string };
}) {
  const [switching, setSwitching] = useState(false);
  async function switchTo() {
    setSwitching(true);
    const res = await fetch(`/api/brands/${project.id}/primary-logo`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: variant.key }),
    });
    if (res.ok) window.location.reload();
    else setSwitching(false);
  }
  return (
    <div className="card overflow-hidden flex flex-col">
      <div
        className="flex items-center justify-center p-6"
        style={{ minHeight: 140, background: "var(--color-surface-2)" }}
      >
        <object
          data={variant.url}
          type="image/svg+xml"
          aria-label={variant.title}
          style={{ maxWidth: "100%", maxHeight: 100, pointerEvents: "none" }}
        />
      </div>
      <div className="p-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="font-medium tracking-tight text-sm mb-1">{variant.title}</div>
        <div className="text-xs mb-3" style={{ color: "var(--color-text-muted)" }}>
          {variant.rationale}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={switchTo}
            disabled={switching}
            className="font-mono text-[11px] hover:underline"
            style={{ color: "var(--color-primary)" }}
          >
            {switching ? "Switching…" : "Use this instead"}
          </button>
          <a
            href={variant.url}
            download
            className="font-mono text-[11px] hover:underline ml-auto"
            style={{ color: "var(--color-text-muted)" }}
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

function Positioning({ brand }: { brand: LiveBrandJson | null }) {
  const text = extractPositioning(brand);
  const tone = extractTone(brand);
  if (!text && tone.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="kicker mb-3">Positioning</div>
      {text && (
        <p
          className="font-serif leading-[1.25]"
          style={{ fontSize: 28, maxWidth: "none" }}
        >
          {text}
        </p>
      )}
      {tone.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {tone.map((t) => (
            <span key={t} className="pill pill-selected">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Palette({ brand }: { brand: LiveBrandJson | null }) {
  const swatches = pickPalette(extractColors(brand) ?? undefined);
  if (swatches.length === 0) return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">01 · Palette</div>
          <h2 className="text-2xl font-medium tracking-tight">Color</h2>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {swatches.map(({ key, hex }) => (
          <div key={key} className="card overflow-hidden">
            <div
              style={{
                height: 180,
                background: hex,
                borderBottom: "1px solid var(--color-border)",
              }}
            />
            <div className="p-4">
              <div className="flex justify-between items-baseline mb-1">
                <div className="font-medium capitalize">{key}</div>
              </div>
              <div
                className="font-mono text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                {hex.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Typography({ brand }: { brand: LiveBrandJson | null }) {
  const { heading: headingName, body: bodyName } = extractTypography(brand);
  if (headingName === "—" && bodyName === "—") return null;
  return (
    <div className="mb-12">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="kicker mb-1">03 · Typography</div>
          <h2 className="text-2xl font-medium tracking-tight">Type system</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="kicker mb-3">Heading · {headingName}</div>
          <div
            className="leading-[1.05] tracking-tight"
            style={{ fontSize: 48, fontWeight: 600, fontFamily: headingName }}
          >
            From intake
            <br />
            to income.
          </div>
        </div>
        <div className="card p-6">
          <div className="kicker mb-3">Body · {bodyName}</div>
          <p
            style={{ fontSize: 15, lineHeight: 1.6, maxWidth: "42ch", fontFamily: bodyName }}
          >
            Every specimen uses the exact font stack the skill selected, rendered live so
            you see how it reads. Direction: precise, restrained, quietly confident.
          </p>
        </div>
      </div>
    </div>
  );
}

function Downloads({ project }: { project: BrandProject }) {
  const items: Array<{ key: string; label: string; meta: string; url?: string }> = [
    { key: "playbookPdf", label: "Brand Playbook", meta: "PDF · multi-page", url: project.outputs.playbookPdf },
    { key: "landingHtml", label: "Landing page", meta: "HTML · ready to host", url: project.outputs.landingHtml },
    { key: "brandJson", label: "Brand JSON", meta: "Machine-readable tokens", url: project.outputs.brandJson },
    { key: "logoSvg", label: "Logo", meta: "SVG · primary + variants", url: project.outputs.logoSvg },
    { key: "playbookHtml", label: "Playbook HTML", meta: "Source HTML for the PDF", url: project.outputs.playbookHtml },
  ].filter((i) => i.url);

  if (items.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="kicker mb-3">Downloads</div>
      <div className="card overflow-hidden">
        {items.map((it, i) => (
          <div
            key={it.key}
            className={`flex items-center gap-3 px-5 py-3.5 ${i > 0 ? "border-t" : ""}`}
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border)",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                <path d="M3 1h5l3 3v9H3zM8 1v3h3" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {it.meta}
              </div>
            </div>
            <a href={it.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
              Open →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
