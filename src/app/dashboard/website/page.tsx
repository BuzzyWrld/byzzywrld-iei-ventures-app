'use client';

import { useState } from 'react';

export default function WebsitePage() {
  const [deploying, setDeploying] = useState(false);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Website · Apex Studio</div>
        <h1 style={headingStyle}>Your Landing Page</h1>
        <p style={subtextStyle}>AI-generated and deployed. Edit content, check analytics, or redeploy.</p>
      </div>

      {/* Status bar */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#50C878' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Live</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono', monospace" }}>
              apexstudio.vercel.app
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a
            href="https://apexstudio.vercel.app"
            target="_blank"
            rel="noreferrer"
            style={primaryBtnStyle}
          >
            Visit Site →
          </a>
          <button
            onClick={() => { setDeploying(true); setTimeout(() => setDeploying(false), 2000); }}
            style={ghostBtnStyle}
          >
            {deploying ? '◐ Deploying...' : 'Redeploy'}
          </button>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Site preview */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Preview
          </div>
          <div
            style={{
              width: '100%',
              aspectRatio: '16/10',
              background: '#1A1A2E',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#F5CE00' }}>
              Apex Studio
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Where vision meets velocity.
            </div>
            <div style={{ padding: '8px 16px', background: '#F5CE00', color: '#0A0A0A', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
              Start Building
            </div>
          </div>
        </div>

        {/* Site settings */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Site Settings
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Page Title</label>
            <input
              defaultValue="Apex Studio — Creative Agency"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Meta Description</label>
            <textarea
              defaultValue="Where vision meets velocity. AI-powered brand development for creative agencies."
              style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Custom Domain</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                defaultValue="apexstudio.com"
                style={{ ...inputStyle, flex: 1 }}
              />
              <button style={ghostBtnStyle}>Connect</button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>CTA Text</label>
            <input
              defaultValue="Start Building"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Deployment history */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
          Deployment History
        </div>
        {[
          { id: 'dpl_a1b2c3', time: 'Today at 2:14pm', status: 'live', commit: 'Brand colors updated' },
          { id: 'dpl_d4e5f6', time: 'Yesterday at 4:30pm', status: 'superseded', commit: 'Initial deploy' },
          { id: 'dpl_g7h8i9', time: 'May 23 at 11:00am', status: 'superseded', commit: 'Scaffold from intake' },
        ].map((d) => (
          <div
            key={d.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: d.status === 'live' ? '#50C878' : 'rgba(255,255,255,0.2)',
                }}
              />
              <div>
                <div style={{ fontSize: 12, color: '#fff' }}>{d.commit}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {d.id}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{d.time}</div>
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
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: '18px 20px',
};
const primaryBtnStyle: React.CSSProperties = {
  background: '#F5CE00',
  color: '#0A0A0A',
  border: 'none',
  padding: '8px 14px',
  borderRadius: 5,
  fontWeight: 600,
  fontSize: 11,
  cursor: 'pointer',
  textDecoration: 'none',
  fontFamily: "'DM Sans', sans-serif",
};
const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '8px 14px',
  borderRadius: 5,
  fontWeight: 500,
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '1px',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 5,
  color: '#fff',
  fontSize: 12,
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
};
