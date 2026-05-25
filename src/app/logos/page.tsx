import Link from "next/link";

// Ported from design-package/output/Logo Directions.html
// Three logo concepts for IEI Ventures. Pick one — the chosen direction
// replaces <IeiMark> across the app.

export default function LogosPreviewPage() {
  return (
    <>
      <style>{LOGOS_CSS}</style>
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-10">
          <div className="kicker mb-2">Logo directions · wireframe · v0.1</div>
          <h1 className="font-display leading-[1.02] mb-2" style={{ fontSize: 48 }}>
            Three directions. Pick one (or mix).
          </h1>
          <p className="text-base" style={{ color: "var(--color-text-muted)", maxWidth: "60ch" }}>
            Proportions and marks are intentional; finish is not. Direction 2 is currently
            wired across the app — let me know which one to commit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
            <span className="flex items-center gap-2"><span className="legend-swatch" style={{ background: "#c2410c" }} /> dir 1 — serif monogram</span>
            <span className="flex items-center gap-2"><span className="legend-swatch" style={{ background: "#0f4c4a" }} /> dir 2 — bracketed container</span>
            <span className="flex items-center gap-2"><span className="legend-swatch" style={{ background: "#3730a3" }} /> dir 3 — typographic rule</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Direction1 />
          <Direction2 />
          <Direction3 />
        </div>

        <footer
          className="mt-10 pt-8 border-t flex flex-wrap items-center justify-between gap-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="font-display" style={{ fontSize: 20 }}>
            Which direction feels right?
          </p>
          <Link href="/" className="btn btn-ghost btn-sm">
            ← Back to dashboard
          </Link>
        </footer>
      </div>
    </>
  );
}

/* --------------- Direction 1 — Serif monogram --------------- */

function Direction1() {
  return (
    <section className="logos-col">
      <div className="col-head">
        <div className="num">1</div>
        <div className="name">Serif monogram</div>
        <div className="tag">ramp / arc lineage</div>
      </div>

      <Panel label="01 · primary lockup">
        <div className="stage">
          <div className="d1-word">
            <span className="iei">
              IEI<span className="dot" />
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 10 }}>
          <div className="d1-word" style={{ gap: 10 }}>
            <span className="iei" style={{ fontSize: 34 }}>IEI</span>
            <span className="dot" style={{ width: 5, height: 5, margin: "0 6px 4px" }} />
            <span className="ventures">Ventures</span>
          </div>
        </div>
        <Note>
          <b>Concept:</b> a serif &ldquo;IEI&rdquo; anchored by a single accent dot — a period
          where the copy ends. Reads as an imprint or a publishing house.
        </Note>
      </Panel>

      <Panel label="02 · icon mark — sizes">
        <div className="icons-row">
          <IconCell cap="128">
            <div className="d1-icon" style={{ fontSize: 52 }}>
              IEI<span className="dot">.</span>
            </div>
          </IconCell>
          <IconCell cap="32 · favicon">
            <div className="d1-icon" style={{ fontSize: 28 }}>
              IEI<span className="dot">.</span>
            </div>
          </IconCell>
          <IconCell cap="16">
            <div className="d1-icon" style={{ fontSize: 16 }}>
              IEI<span className="dot">.</span>
            </div>
          </IconCell>
        </div>
      </Panel>

      <Panel label="03 · monochrome">
        <div className="mono-row">
          <div className="mono-cell light mono-only">
            <div className="d1-word">
              <span className="iei" style={{ fontSize: 34 }}>
                IEI<span className="dot" />
              </span>
            </div>
          </div>
          <div className="mono-cell dark mono-only on-dark">
            <div className="d1-word">
              <span className="iei" style={{ fontSize: 34 }}>
                IEI<span className="dot" />
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <Rationale>
        A serif monogram borrows the authority of a print imprint. The accent dot is the only
        &ldquo;moment,&rdquo; so it carries voice without hijacking the mark when a tenant recolors it.
        <br />
        <br />
        <span style={{ color: "var(--color-text-muted)" }}>
          <b>Feels like:</b> Ramp&apos;s wordmark, publishing houses.
        </span>
      </Rationale>
    </section>
  );
}

/* --------------- Direction 2 — Bracketed container --------------- */

function Direction2() {
  return (
    <section className="logos-col">
      <div className="col-head">
        <div className="num">2</div>
        <div className="name">Bracketed container</div>
        <div className="tag">linear / vercel lineage · current</div>
      </div>

      <Panel label="01 · primary lockup">
        <div className="stage">
          <div className="d2-word">
            <span className="d2-mark">IEI</span>
            <span>IEI Ventures</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div className="d2-word" style={{ fontSize: 22, gap: 10 }}>
            <span className="d2-mark small">IEI</span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
              <span>IEI Ventures</span>
              <span className="ventures" style={{ margin: "2px 0 0", padding: 0, fontSize: 9 }}>
                intake → identity → income
              </span>
            </span>
          </div>
        </div>
        <Note>
          <b>Concept:</b> the monogram lives inside a bordered container with corner ticks — a system
          that <i>holds</i> a brand. Ticks recolor to tenant accent.
        </Note>
      </Panel>

      <Panel label="02 · icon mark — sizes">
        <div className="icons-row">
          <IconCell cap="128">
            <span className="d2-mark" style={{ width: 64, height: 64, fontSize: 20 }}>
              IEI
            </span>
          </IconCell>
          <IconCell cap="32 · favicon">
            <span className="d2-mark small">IEI</span>
          </IconCell>
          <IconCell cap="16">
            <span className="d2-mark tiny">IEI</span>
          </IconCell>
        </div>
      </Panel>

      <Panel label="03 · monochrome">
        <div className="mono-row">
          <div className="mono-cell light mono-only">
            <div className="d2-word" style={{ fontSize: 24, gap: 10 }}>
              <span className="d2-mark small mono">IEI</span>
              <span>IEI Ventures</span>
            </div>
          </div>
          <div className="mono-cell dark mono-only on-dark">
            <div className="d2-word" style={{ fontSize: 24, gap: 10 }}>
              <span className="d2-mark small mono">IEI</span>
              <span>IEI Ventures</span>
            </div>
          </div>
        </div>
      </Panel>

      <Rationale>
        The corner ticks read as &ldquo;input → output&rdquo; — the product&apos;s own thesis:
        intake → identity → income. A container is neutral enough to white-label, specific enough
        to own.
        <br />
        <br />
        <span style={{ color: "var(--color-text-muted)" }}>
          <b>Feels like:</b> Linear, Vercel, a tool operators trust.
        </span>
      </Rationale>
    </section>
  );
}

/* --------------- Direction 3 — Typographic rule --------------- */

function Direction3() {
  return (
    <section className="logos-col">
      <div className="col-head">
        <div className="num">3</div>
        <div className="name">Typographic rule</div>
        <div className="tag">editorial / kerning-led</div>
      </div>

      <Panel label="01 · primary lockup">
        <div className="stage">
          <div className="d3-word">
            <span className="d3-bar" />
            <span className="iei">IEI Ventures</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
          <div className="d3-word" style={{ fontSize: 20, gap: 10 }}>
            <span className="d3-bar" style={{ height: 26, width: 2.5 }} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
              <span className="iei">IEI Ventures</span>
              <span className="ventures" style={{ marginTop: 2, fontSize: 9 }}>
                intake · identity · income
              </span>
            </span>
          </div>
        </div>
        <Note>
          <b>Concept:</b> a single vertical rule stands as the mark. Ticked at the base in the
          accent color — like a margin marker in an editor.
        </Note>
      </Panel>

      <Panel label="02 · icon mark — sizes">
        <div className="icons-row">
          <IconCell cap="128">
            <span className="d3-icon-box" style={{ width: 64, height: 64 }}>
              <span className="d3-bar" style={{ height: 36, width: 3 }} />
            </span>
          </IconCell>
          <IconCell cap="32 · favicon">
            <span className="d3-icon-box">
              <span className="d3-bar" />
            </span>
          </IconCell>
          <IconCell cap="16">
            <span className="d3-icon-box tiny">
              <span className="d3-bar" />
            </span>
          </IconCell>
        </div>
      </Panel>

      <Panel label="03 · monochrome">
        <div className="mono-row">
          <div className="mono-cell light mono-only">
            <div className="d3-word" style={{ fontSize: 22, gap: 10 }}>
              <span className="d3-bar" />
              <span className="iei">IEI Ventures</span>
            </div>
          </div>
          <div className="mono-cell dark mono-only on-dark">
            <div className="d3-word" style={{ fontSize: 22, gap: 10 }}>
              <span className="d3-bar" />
              <span className="iei">IEI Ventures</span>
            </div>
          </div>
        </div>
      </Panel>

      <Rationale>
        The rule is almost not a mark — it&apos;s punctuation. It frames the wordmark, stays
        invisible when you don&apos;t need it, and scales down to a single accent pixel.
        <br />
        <br />
        <span style={{ color: "var(--color-text-muted)" }}>
          <b>Feels like:</b> an editor&apos;s margin rule, publication masthead.
        </span>
      </Rationale>
    </section>
  );
}

/* --------------- Shared bits --------------- */

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="logos-panel">
      <div className="p-label">{label}</div>
      {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return <div className="p-note">{children}</div>;
}

function IconCell({ cap, children }: { cap: string; children: React.ReactNode }) {
  return (
    <div className="icon-cell">
      {children}
      <div className="cap">{cap}</div>
    </div>
  );
}

function Rationale({ children }: { children: React.ReactNode }) {
  return (
    <div className="logos-rationale">
      <div className="r-title">Why this fits</div>
      <p>{children}</p>
    </div>
  );
}

/* --------------- Scoped CSS for the 3 directions --------------- */

const LOGOS_CSS = `
  .legend-swatch {
    display: inline-block;
    width: 10px;
    height: 10px;
    border: 1.5px solid var(--color-primary);
    vertical-align: -1px;
  }
  .logos-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .logos-col .col-head {
    display: flex;
    align-items: baseline;
    gap: 12px;
    border-bottom: 1.5px solid var(--color-primary);
    padding-bottom: 6px;
  }
  .logos-col .num {
    font-family: var(--font-display), serif;
    font-size: 40px;
    line-height: 1;
  }
  .logos-col .name {
    font-family: var(--font-display), serif;
    font-size: 22px;
  }
  .logos-col .tag {
    margin-left: auto;
    font-family: var(--font-mono), monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--color-text-muted);
  }
  .logos-panel {
    background: var(--color-surface);
    border: 1.5px solid var(--color-primary);
    position: relative;
    padding: 22px;
  }
  .logos-panel .p-label {
    position: absolute;
    top: -9px; left: 14px;
    background: var(--color-surface);
    padding: 0 8px;
    font-family: var(--font-mono), monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: var(--color-text-muted);
  }
  .logos-panel .p-note {
    font-size: 13.5px;
    color: var(--color-text-muted);
    line-height: 1.5;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px dashed var(--color-border);
  }
  .logos-panel .p-note b { color: var(--color-text); }

  .stage {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 130px;
    padding: 20px 8px;
    background:
      linear-gradient(var(--color-border) 1px, transparent 1px) 0 0 / 12px 12px,
      linear-gradient(90deg, var(--color-border) 1px, transparent 1px) 0 0 / 12px 12px,
      #fff;
    border: 1px dashed var(--color-border);
  }
  .icons-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    align-items: end;
  }
  .icon-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 10px 8px;
    background: #fff;
    border: 1px dashed var(--color-border);
  }
  .icon-cell .cap {
    font-family: var(--font-mono), monospace;
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
  }

  .mono-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .mono-cell {
    padding: 18px 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px dashed var(--color-border);
  }
  .mono-cell.light { background: #fff; }
  .mono-cell.dark { background: #111; }

  .logos-rationale {
    border: 1.5px solid var(--color-primary);
    padding: 18px 20px;
    background: var(--color-surface);
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .logos-rationale .r-title {
    font-family: var(--font-display), serif;
    font-size: 18px;
  }
  .logos-rationale p {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
  }

  /* ===== Dir 1 — Serif monogram ===== */
  .d1-word {
    font-family: var(--font-display), serif;
    letter-spacing: -0.02em;
    color: var(--color-primary);
    display: inline-flex;
    align-items: baseline;
    gap: 0;
  }
  .d1-word .iei {
    font-size: 64px;
    line-height: 0.9;
    position: relative;
  }
  .d1-word .iei > .dot {
    display: inline-block;
    width: 7px; height: 7px;
    background: #c2410c;
    border-radius: 50%;
    margin: 0 10px 8px;
    align-self: flex-end;
    vertical-align: baseline;
  }
  .d1-word .dot {
    display: inline-block;
    width: 7px; height: 7px;
    background: #c2410c;
    border-radius: 50%;
    margin: 0 10px 8px;
    align-self: flex-end;
  }
  .d1-word .ventures {
    font-family: var(--font-mono), monospace;
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--color-primary);
  }
  .d1-icon {
    font-family: var(--font-display), serif;
    color: var(--color-primary);
    letter-spacing: -0.04em;
    line-height: 1;
  }
  .d1-icon .dot { color: #c2410c; }

  /* ===== Dir 2 — Bracketed container ===== */
  .d2-word {
    font-family: var(--font-body), sans-serif;
    font-weight: 600;
    font-size: 32px;
    letter-spacing: -0.02em;
    color: var(--color-primary);
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .d2-mark {
    position: relative;
    width: 56px; height: 56px;
    border: 2px solid var(--color-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono), monospace;
    font-weight: 600;
    font-size: 18px;
    letter-spacing: 0;
    color: var(--color-primary);
  }
  .d2-mark::before, .d2-mark::after {
    content: '';
    position: absolute;
    width: 10px; height: 10px;
    border: 2px solid #0f4c4a;
    background: var(--color-surface);
  }
  .d2-mark::before { top: -6px; left: -6px; border-right: none; border-bottom: none; }
  .d2-mark::after { bottom: -6px; right: -6px; border-left: none; border-top: none; }
  .d2-word .ventures {
    font-family: var(--font-mono), monospace;
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--color-text-muted);
  }
  .d2-mark.small { width: 36px; height: 36px; font-size: 13px; }
  .d2-mark.small::before, .d2-mark.small::after { width: 7px; height: 7px; }
  .d2-mark.tiny { width: 22px; height: 22px; font-size: 9px; border-width: 1.5px; }
  .d2-mark.tiny::before, .d2-mark.tiny::after { width: 5px; height: 5px; border-width: 1.5px; }
  .d2-mark.mono::before, .d2-mark.mono::after { border-color: currentColor; }

  /* ===== Dir 3 — Typographic rule ===== */
  .d3-word {
    font-family: var(--font-body), sans-serif;
    font-weight: 500;
    font-size: 30px;
    letter-spacing: -0.015em;
    color: var(--color-primary);
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .d3-bar {
    display: inline-block;
    width: 3px; height: 38px;
    background: var(--color-primary);
    position: relative;
  }
  .d3-bar::after {
    content: '';
    position: absolute;
    left: 0; bottom: -1px;
    width: 3px; height: 10px;
    background: #3730a3;
  }
  .d3-word .iei { font-weight: 600; letter-spacing: -0.02em; }
  .d3-word .ventures {
    font-family: var(--font-mono), monospace;
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.22em;
    color: var(--color-text-muted);
  }
  .d3-icon-box {
    width: 44px; height: 44px;
    border: 1.5px solid var(--color-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .d3-icon-box .d3-bar { height: 26px; width: 2.5px; }
  .d3-icon-box .d3-bar::after { width: 2.5px; height: 7px; }
  .d3-icon-box.tiny { width: 22px; height: 22px; border-width: 1px; }
  .d3-icon-box.tiny .d3-bar { height: 12px; width: 2px; }
  .d3-icon-box.tiny .d3-bar::after { width: 2px; height: 4px; }

  /* dark variants */
  .on-dark, .on-dark .d1-word, .on-dark .d1-icon,
  .on-dark .d2-word, .on-dark .d3-word { color: #fafaf7; }
  .on-dark .d2-mark { border-color: #fafaf7; color: #fafaf7; }
  .on-dark .d3-bar { background: #fafaf7; }
  .on-dark .d3-icon-box { border-color: #fafaf7; }
  .on-dark .d2-word .ventures,
  .on-dark .d3-word .ventures { color: #bdbdb7; }

  /* mono (kill accent) */
  .mono-only .d1-word .dot { background: currentColor; }
  .mono-only .d2-mark::before, .mono-only .d2-mark::after { border-color: currentColor; background: transparent; }
  .mono-only .d3-bar::after { background: currentColor; }
`;
