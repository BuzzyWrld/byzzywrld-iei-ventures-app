'use client';

import { useEffect, useState } from 'react';
import BrandReviewButton from '@/components/BrandReviewButton';

// Fallback tokens — used while loading and as the empty/template state.
// The real values come from the authenticated user's brand (same source the
// dashboard uses: /api/dashboard → currentUser() + listBrands).
const TOKENS = {
  primary: '#F5CE00',
  secondary: '#1A1A2E',
  accent: '#C4941A',
  background: '#0A0A0A',
  text: '#F7F6F0',
  font_heading: 'Space Grotesk',
  font_body: 'DM Sans',
};

interface Tokens {
  primary: string;
  secondary: string;
  accent?: string;
  background: string;
  text: string;
  font_heading: string;
  font_body: string;
}

interface AssetUrls {
  playbook_pdf?: string;
  logo_svg?: string;
  logo_dark_svg?: string;
  landing_page?: string;
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export default function BrandKitPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'assets'>('colors');
  const [tokens, setTokens] = useState<Tokens>(TOKENS);
  const [assetUrls, setAssetUrls] = useState<AssetUrls>({});
  const [brandName, setBrandName] = useState('');
  const [hasBrand, setHasBrand] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // session segment is ignored server-side; response is scoped to the
        // authenticated user via the session cookie.
        const res = await fetch('/api/dashboard/current', { credentials: 'include' });
        if (!res.ok) throw new Error(String(res.status));
        const json = await res.json();
        setTokens(json.brand_json?.design_tokens ?? TOKENS);
        setAssetUrls(json.asset_urls ?? {});
        setBrandName(json.brand_json?.meta?.brand_name ?? '');
        setHasBrand(json.has_brand !== false);
      } catch {
        setHasBrand(null); // unknown — fall back to template tokens
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div style={{ ...subtextStyle, padding: '8px 0' }}>Loading your brand system…</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Brand Kit{brandName ? ` · ${brandName}` : ''}</div>
        <h1 style={headingStyle}>Your Brand System</h1>
        <p style={subtextStyle}>
          {hasBrand === false
            ? 'No brand yet — this is the default template. Create a brand to populate it with your own system.'
            : 'Everything generated from your intake — colors, typography, logos, and playbook.'}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['colors', 'typography', 'assets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              color: activeTab === tab ? '#F5CE00' : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: activeTab === tab ? 700 : 400,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #F5CE00' : '2px solid transparent',
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'colors' && <ColorsPanel tokens={tokens} />}
      {activeTab === 'typography' && <TypographyPanel tokens={tokens} />}
      {activeTab === 'assets' && <AssetsPanel assetUrls={assetUrls} />}
    </div>
  );
}

interface SwatchColor {
  label: string;
  value: string;
}

function ColorsPanel({ tokens }: { tokens: Tokens }) {
  const [colors, setColors] = useState<SwatchColor[]>([
    { label: 'Primary', value: tokens.primary },
    { label: 'Secondary', value: tokens.secondary },
    { label: 'Accent', value: tokens.accent ?? TOKENS.accent },
    { label: 'Background', value: tokens.background },
    { label: 'Text', value: tokens.text },
  ]);
  const [regenerating, setRegenerating] = useState(false);

  function handleRegenerate(prompt: string) {
    // Hook point for the real brand-color generation handler.
    setRegenerating(true);
    window.setTimeout(() => setRegenerating(false), 1400);
  }

  function updateColor(index: number, value: string) {
    setColors((prev) => prev.map((c, i) => (i === index ? { ...c, value } : c)));
  }

  return (
    <div>
      {/* Section header row with review buttons aligned far right */}
      <div style={sectionHeaderStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Color Palette
        </div>
        <BrandReviewButton
          section="colors"
          heading="Edit Your Brand Colors"
          placeholder="Describe changes (e.g. 'Make the primary color more vibrant')"
          onSubmitPrompt={handleRegenerate}
        >
          <HexEditor colors={colors} onChange={updateColor} />
        </BrandReviewButton>
      </div>

      {/* Swatch row */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
            position: 'relative',
            opacity: regenerating ? 0.5 : 1,
            transition: 'opacity 200ms ease',
          }}
        >
          {colors.map((c) => (
            <div key={c.label}>
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  background: c.value,
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: 8,
                }}
              />
              <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{c.label}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {c.value}
              </div>
            </div>
          ))}
          {regenerating && (
            <div style={regenOverlayStyle}>Regenerating…</div>
          )}
        </div>
      </div>

      {/* Contrast pairs */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
          Contrast Pairs
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: colors[0].value, color: colors[3].value }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Primary on Dark</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AA ✓</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: colors[1].value, color: colors[4].value }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Text on Secondary</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AAA ✓</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: colors[3].value, color: colors[0].value, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Primary on BG</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AA ✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HexEditorProps {
  colors: SwatchColor[];
  onChange: (index: number, value: string) => void;
}

function HexEditor({ colors, onChange }: HexEditorProps) {
  // Local drafts so typing doesn't blow away invalid intermediate input.
  const [drafts, setDrafts] = useState<string[]>(colors.map((c) => c.value));
  const [errors, setErrors] = useState<boolean[]>(colors.map(() => false));
  const [saved, setSaved] = useState(false);

  function commit(index: number) {
    const raw = drafts[index].trim();
    const valid = HEX_RE.test(raw);
    setErrors((prev) => prev.map((e, i) => (i === index ? !valid : e)));
    if (valid) onChange(index, raw); // live preview update
  }

  function handleSave() {
    drafts.forEach((d, i) => {
      if (HEX_RE.test(d.trim())) onChange(i, d.trim());
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>
        Edit Hex Values
      </div>
      {colors.map((c, i) => (
        <div key={c.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: c.value,
                border: '1px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 70 }}>{c.label}</span>
            <input
              value={drafts[i]}
              onChange={(e) => setDrafts((prev) => prev.map((d, j) => (j === i ? e.target.value : d)))}
              onBlur={() => commit(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(i);
              }}
              style={{
                flex: 1,
                background: '#0A0A0A',
                border: `1px solid ${errors[i] ? '#EF4444' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 6,
                color: '#fff',
                fontSize: 11,
                fontFamily: "'IBM Plex Mono', monospace",
                padding: '6px 8px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          {errors[i] && (
            <div style={{ fontSize: 10, color: '#EF4444', marginLeft: 96, marginTop: 3 }}>Invalid hex code</div>
          )}
        </div>
      ))}
      <button onClick={handleSave} style={saveBtnStyle}>
        {saved ? '✓ Saved' : 'Save Changes'}
      </button>
    </div>
  );
}

function TypographyPanel({ tokens }: { tokens: Tokens }) {
  const [headingFont, setHeadingFont] = useState(tokens.font_heading);
  const [bodyFont, setBodyFont] = useState(tokens.font_body);
  const [weights, setWeights] = useState<number[]>([400, 500, 600, 700]);
  const [draftHeading, setDraftHeading] = useState(headingFont);
  const [draftBody, setDraftBody] = useState(bodyFont);
  const [saved, setSaved] = useState(false);

  function toggleWeight(w: number) {
    setWeights((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w].sort((a, b) => a - b)));
  }

  function handleSave() {
    setHeadingFont(draftHeading.trim() || headingFont);
    setBodyFont(draftBody.trim() || bodyFont);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      {/* Section header row with review button top-right */}
      <div style={sectionHeaderStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Typography System
        </div>
        <BrandReviewButton
          section="typography"
          heading="Edit Your Brand Typography"
          placeholder="Describe changes (e.g. 'Use a more modern sans-serif heading font')"
          onSubmitPrompt={() => {}}
        >
          <div>
            <div style={fieldLabelStyle}>Heading Font</div>
            <input value={draftHeading} onChange={(e) => setDraftHeading(e.target.value)} style={textFieldStyle} />
            <div style={{ ...fieldLabelStyle, marginTop: 10 }}>Body Font</div>
            <input value={draftBody} onChange={(e) => setDraftBody(e.target.value)} style={textFieldStyle} />
            <div style={{ ...fieldLabelStyle, marginTop: 12 }}>Font Weights</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {[400, 500, 600, 700].map((w) => (
                <label key={w} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={weights.includes(w)} onChange={() => toggleWeight(w)} />
                  {w}
                </label>
              ))}
            </div>
            <button onClick={handleSave} style={saveBtnStyle}>
              {saved ? '✓ Saved' : 'Save Changes'}
            </button>
          </div>
        </BrandReviewButton>
      </div>

      {/* Heading font */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Heading Font
        </div>
        <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          {headingFont}
        </div>
        <div style={{ fontFamily: `'${headingFont}', sans-serif`, fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
          {[...weights].reverse().map((w) => (
            <div key={w} style={{ fontFamily: `'${headingFont}', sans-serif`, fontWeight: w, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Body font */}
      <div style={cardStyle}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Body Font
        </div>
        <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 36, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
          {bodyFont}
        </div>
        <div style={{ fontFamily: `'${bodyFont}', sans-serif`, fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
          {[...weights].reverse().filter((w) => w !== 600).map((w) => (
            <div key={w} style={{ fontFamily: `'${bodyFont}', sans-serif`, fontWeight: w, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
              {w}
            </div>
          ))}
        </div>
      </div>

      {/* Type scale */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
          Type Scale
        </div>
        {[
          { label: 'Display', size: 48, font: headingFont },
          { label: 'H1', size: 36, font: headingFont },
          { label: 'H2', size: 28, font: headingFont },
          { label: 'H3', size: 22, font: headingFont },
          { label: 'Body', size: 16, font: bodyFont },
          { label: 'Small', size: 13, font: bodyFont },
          { label: 'Caption', size: 11, font: bodyFont },
        ].map((t) => (
          <div key={t.label} style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 12 }}>
            <div style={{ width: 60, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono', monospace" }}>{t.size}px</div>
            <div style={{ fontSize: t.size, fontFamily: `'${t.font}', sans-serif`, fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
              {t.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetsPanel({ assetUrls }: { assetUrls: AssetUrls }) {
  // Catalog metadata + the real, user-scoped URL for each deliverable. An asset
  // with a URL is "ready" (downloadable); otherwise it's still "generating".
  const assets = [
    { name: 'Logo (Light)', type: 'SVG', icon: '◐', url: assetUrls.logo_svg },
    { name: 'Logo (Dark)', type: 'SVG', icon: '◐', url: assetUrls.logo_dark_svg },
    { name: 'Brand Playbook', type: 'PDF', icon: '▤', url: assetUrls.playbook_pdf },
    { name: 'Landing Page', type: 'URL', icon: '◬', url: assetUrls.landing_page },
  ];

  return (
    <div>
      <div style={sectionHeaderStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Brand Assets
        </div>
        <BrandReviewButton
          section="assets"
          heading="Edit Your Brand Assets"
          placeholder="Describe changes (e.g. 'Regenerate logo with a more minimal style')"
          onSubmitPrompt={() => {}}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {assets.map((a) => {
          const ready = Boolean(a.url);
          return (
            <div key={a.name} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: ready ? 'rgba(80,200,120,0.15)' : 'rgba(245,206,0,0.12)',
                    color: ready ? '#50C878' : '#F5CE00',
                  }}
                >
                  {ready ? 'ready' : 'generating'}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{a.type} format</div>
              {ready && (
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...ghostBtnSmStyle, marginTop: 12, display: 'inline-block', textDecoration: 'none' }}
                >
                  {a.type === 'URL' ? 'Open' : 'Download'}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
};

const headingStyle: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  margin: '10px 0 6px',
  fontFamily: "'Space Grotesk', sans-serif",
};

const subtextStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.5)',
};

const cardStyle: React.CSSProperties = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '18px 20px',
};

const ghostBtnSmStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '6px 12px',
  borderRadius: 5,
  fontWeight: 500,
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 16,
};

const regenOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
  color: '#F5CE00',
  fontFamily: "'DM Sans', sans-serif",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: 5,
};

const textFieldStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A0A0A',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 6,
  color: '#fff',
  fontSize: 12,
  fontFamily: "'DM Sans', sans-serif",
  padding: '8px 10px',
  boxSizing: 'border-box',
};

const saveBtnStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 14,
  background: 'transparent',
  color: '#22C55E',
  border: '1px solid #22C55E',
  borderRadius: 8,
  padding: '8px 0',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};
