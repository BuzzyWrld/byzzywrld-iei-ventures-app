"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ScrapeResult = {
  url: string;
  title: string;
  description: string;
  hero: { h1: string; subtitle: string };
  colors: string[];
  fonts: string[];
};

export default function ExistingBrandPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gap-fill fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function scrape() {
    if (!url) return;
    setScraping(true);
    setError(null);
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: normalized }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setScraping(false);
      return;
    }
    const { result } = (await res.json()) as { result: ScrapeResult };
    setResult(result);
    if (result.title) setCompanyName(result.title.split(/[·|—\-]/)[0].trim());
    setScraping(false);
  }

  async function submit() {
    if (!result) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        industry,
        targetAudience,
        toneOfVoice: "confident, clear",
        competitors: "",
        archetype: "",
        palettePreference: result.colors.slice(0, 4).join(", "),
        notes: [
          `Scraped from ${result.url}`,
          result.description && `Meta: ${result.description}`,
          result.hero.h1 && `Hero H1: ${result.hero.h1}`,
          result.hero.subtitle && `Hero subtitle: ${result.hero.subtitle}`,
          result.fonts.length && `Detected fonts: ${result.fonts.join(", ")}`,
        ].filter(Boolean).join("\n"),
      }),
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
      {/* Mode switch */}
      <div className="flex items-center justify-between gap-6 mb-8 flex-wrap">
        <div className="flex gap-1.5 text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
          <Link href="/new" className="px-2 py-1 rounded" style={{ color: "var(--color-text-muted)" }}>
            New brand
          </Link>
          <span
            className="px-2 py-1 rounded"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            I have existing assets
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8 md:gap-12 items-start max-w-[1100px]">
        <div>
          <div className="kicker mb-3">Existing brand intake</div>
          <h1 className="font-serif leading-[1.05] mb-3" style={{ fontSize: 40 }}>
            Show us what you&apos;ve got. We&apos;ll fill in the rest.
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--color-text-muted)", maxWidth: "54ch" }}>
            Paste your existing site and we&apos;ll scan it to infer palette, fonts, and voice. Then answer 2–3 short questions to close the gaps.
          </p>

          {!result ? (
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block" htmlFor="url-scan">
                  Existing website
                </label>
                <div className="flex items-stretch">
                  <span
                    className="font-mono text-xs inline-flex items-center px-3"
                    style={{
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      borderRight: "none",
                      borderRadius: "var(--r-md) 0 0 var(--r-md)",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    https://
                  </span>
                  <input
                    id="url-scan"
                    className="input"
                    style={{ borderRadius: "0 var(--r-md) var(--r-md) 0" }}
                    placeholder="aurelianlabs.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && scrape()}
                    disabled={scraping}
                  />
                </div>
                <div className="text-xs mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                  We&apos;ll scan public pages and infer palette, fonts, and voice.
                </div>
              </div>

              {/* File upload UI is visual only for now — backend wiring is future work. */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Brand assets{" "}
                  <span className="font-mono text-xs" style={{ color: "var(--color-text-muted)" }}>
                    (coming soon)
                  </span>
                </label>
                <div
                  className="p-8 text-center"
                  style={{
                    border: "1.5px dashed var(--color-border)",
                    borderRadius: "var(--r-lg)",
                    background: "var(--color-surface)",
                    opacity: 0.55,
                  }}
                >
                  <svg
                    className="mx-auto mb-2"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    <path d="M12 3v14M6 9l6-6 6 6M4 21h16" />
                  </svg>
                  <div className="font-medium">Logo, brand guide, swatch files</div>
                  <div className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
                    SVG, PNG, PDF · drag-and-drop coming in the next build
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Link href="/new" className="btn btn-ghost">
                  Skip — answer intake instead
                </Link>
                <button
                  type="button"
                  className="btn btn-primary ml-auto"
                  disabled={!url || scraping}
                  onClick={scrape}
                >
                  {scraping ? (
                    <>
                      <span className="spinner" /> Scanning…
                    </>
                  ) : (
                    "Parse assets"
                  )}
                </button>
              </div>
              {error && (
                <p className="text-sm" style={{ color: "var(--color-status-failed)" }}>
                  {error}
                </p>
              )}
            </div>
          ) : (
            <ParsedResult
              result={result}
              companyName={companyName}
              industry={industry}
              targetAudience={targetAudience}
              submitting={submitting}
              error={error}
              onCompany={setCompanyName}
              onIndustry={setIndustry}
              onAudience={setTargetAudience}
              onBack={() => setResult(null)}
              onSubmit={submit}
            />
          )}
        </div>

        <aside className="card p-5 md:sticky md:top-24 hidden md:block">
          <div className="flex items-center gap-2 mb-3">
            <span className="iei-mark size-sm">IEI</span>
            <span className="kicker" style={{ letterSpacing: "0.1em" }}>
              How this works
            </span>
          </div>
          <ol className="text-sm space-y-3">
            <li className="flex gap-3">
              <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: "var(--color-text-muted)" }}>
                01
              </span>
              <span>Paste your URL.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: "var(--color-text-muted)" }}>
                02
              </span>
              <span>We detect colors, fonts, and existing copy.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-mono text-xs shrink-0 pt-0.5" style={{ color: "var(--color-text-muted)" }}>
                03
              </span>
              <span>You confirm, fill 2–3 gaps, and we build the kit.</span>
            </li>
          </ol>
        </aside>
      </div>
    </>
  );
}

function ParsedResult({
  result,
  companyName,
  industry,
  targetAudience,
  submitting,
  error,
  onCompany,
  onIndustry,
  onAudience,
  onBack,
  onSubmit,
}: {
  result: ScrapeResult;
  companyName: string;
  industry: string;
  targetAudience: string;
  submitting: boolean;
  error: string | null;
  onCompany: (v: string) => void;
  onIndustry: (v: string) => void;
  onAudience: (v: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="card p-5">
        <div className="kicker mb-3">Detected from {result.url}</div>
        {result.hero.h1 && (
          <div className="mb-4">
            <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
              Hero
            </div>
            <div className="font-medium">{result.hero.h1}</div>
            {result.hero.subtitle && (
              <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {result.hero.subtitle}
              </div>
            )}
          </div>
        )}
        {result.colors.length > 0 && (
          <div className="mb-4">
            <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              Palette
            </div>
            <div className="flex gap-1.5">
              {result.colors.map((c) => (
                <span
                  key={c}
                  className="rounded"
                  style={{
                    width: 40,
                    height: 40,
                    background: c,
                    border: "1px solid var(--color-border)",
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}
        {result.fonts.length > 0 && (
          <div>
            <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
              Fonts
            </div>
            <div className="flex flex-wrap gap-1.5">
              {result.fonts.map((f) => (
                <span key={f} className="pill">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="kicker mb-3">Gaps to fill</div>
        <label className="block mb-3">
          <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
            Company name
          </div>
          <input
            className="input"
            value={companyName}
            onChange={(e) => onCompany(e.target.value)}
          />
        </label>
        <label className="block mb-3">
          <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
            Industry
          </div>
          <input
            className="input"
            placeholder="e.g. AI / Financial Services"
            value={industry}
            onChange={(e) => onIndustry(e.target.value)}
          />
        </label>
        <label className="block">
          <div className="text-xs mb-1.5" style={{ color: "var(--color-text-muted)" }}>
            Target audience
          </div>
          <input
            className="input"
            placeholder="e.g. Capital markets operators"
            value={targetAudience}
            onChange={(e) => onAudience(e.target.value)}
          />
        </label>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button type="button" className="btn btn-ghost" onClick={onBack} disabled={submitting}>
          ← Scan another
        </button>
        <button
          type="button"
          className="btn btn-primary ml-auto"
          disabled={submitting || !companyName || !industry || !targetAudience}
          onClick={onSubmit}
        >
          {submitting ? (
            <>
              <span className="spinner" /> Running skill…
            </>
          ) : (
            "Build brand"
          )}
        </button>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "var(--color-status-failed)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
