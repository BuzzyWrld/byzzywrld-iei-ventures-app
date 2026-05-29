'use client';

import { useState } from 'react';

const TOKENS = {
  primary: '#F5CE00',
  secondary: '#1A1A2E',
  accent: '#C4941A',
  background: '#0A0A0A',
  text: '#F7F6F0',
  font_heading: 'Space Grotesk',
  font_body: 'DM Sans',
};

const ASSETS = [
  { name: 'Logo (Light)', type: 'SVG', status: 'ready', icon: '◐' },
  { name: 'Logo (Dark)', type: 'SVG', status: 'ready', icon: '◐' },
  { name: 'Brand Playbook', type: 'PDF', status: 'ready', icon: '��' },
  { name: 'Social Kit', type: 'ZIP', status: 'ready', icon: '◬' },
  { name: 'Email Signature', type: 'HTML', status: 'generating', icon: '◯' },
  { name: 'Favicon Pack', type: 'ZIP', status: 'ready', icon: '◇' },
];

export default function BrandKitPage() {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'assets'>('colors');

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Brand Kit · Apex Studio</div>
        <h1 style={headingStyle}>Your Brand System</h1>
        <p style={subtextStyle}>
          Everything generated from your intake — colors, typography, logos, and playbook.
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
      {activeTab === 'colors' && <ColorsPanel />}
      {activeTab === 'typography' && <TypographyPanel />}
      {activeTab === 'assets' && <AssetsPanel />}
    </div>
  );
}

function ColorsPanel() {
  const colors = [
    { label: 'Primary', value: TOKENS.primary },
    { label: 'Secondary', value: TOKENS.secondary },
    { label: 'Accent', value: TOKENS.accent },
    { label: 'Background', value: TOKENS.background },
    { label: 'Text', value: TOKENS.text },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
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
      </div>

      {/* Contrast pairs */}
      <div style={cardStyle}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>
          Contrast Pairs
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: TOKENS.primary, color: TOKENS.background }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Primary on Dark</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AA ✓</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: TOKENS.secondary, color: TOKENS.text }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Text on Secondary</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AAA ✓</div>
          </div>
          <div style={{ flex: 1, padding: 16, borderRadius: 6, background: TOKENS.background, color: TOKENS.primary, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Primary on BG</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>WCAG AA ✓</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypographyPanel() {
  return (
    <div>
      {/* Heading font */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
          Heading Font
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 42, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
          Space Grotesk
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
          {[700, 600, 500, 400].map((w) => (
            <div key={w} style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: w, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
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
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 36, fontWeight: 400, color: '#fff', marginBottom: 8 }}>
          DM Sans
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
          ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 20 }}>
          {[700, 500, 400].map((w) => (
            <div key={w} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: w, fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
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
          { label: 'Display', size: 48, font: 'Space Grotesk' },
          { label: 'H1', size: 36, font: 'Space Grotesk' },
          { label: 'H2', size: 28, font: 'Space Grotesk' },
          { label: 'H3', size: 22, font: 'Space Grotesk' },
          { label: 'Body', size: 16, font: 'DM Sans' },
          { label: 'Small', size: 13, font: 'DM Sans' },
          { label: 'Caption', size: 11, font: 'DM Sans' },
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

function AssetsPanel() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {ASSETS.map((a) => (
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
                  background: a.status === 'ready' ? 'rgba(80,200,120,0.15)' : 'rgba(245,206,0,0.12)',
                  color: a.status === 'ready' ? '#50C878' : '#F5CE00',
                }}
              >
                {a.status}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{a.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{a.type} format</div>
            {a.status === 'ready' && (
              <button style={{ ...ghostBtnSmStyle, marginTop: 12 }}>Download</button>
            )}
          </div>
        ))}
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
