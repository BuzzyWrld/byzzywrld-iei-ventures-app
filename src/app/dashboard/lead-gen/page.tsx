'use client';

import { useState } from 'react';

const PROSPECTS = [
  { name: 'Sarah Chen', company: 'Bloom Creative', score: 92, status: 'hot', industry: 'Branding' },
  { name: 'Marcus Rivera', company: 'Northwind Labs', score: 87, status: 'hot', industry: 'SaaS' },
  { name: 'Elena Kowalski', company: 'Studio Drift', score: 81, status: 'warm', industry: 'Design' },
  { name: 'James Okafor', company: 'Atlas Ventures', score: 76, status: 'warm', industry: 'Finance' },
  { name: 'Lisa Park', company: 'Pixel & Grain', score: 72, status: 'warm', industry: 'Photography' },
  { name: 'David Nguyen', company: 'CloudBridge', score: 65, status: 'cold', industry: 'Tech' },
  { name: 'Aisha Patel', company: 'Saffron Co.', score: 61, status: 'cold', industry: 'E-commerce' },
];

const OUTREACH = [
  { prospect: 'Sarah Chen', type: 'Email', sent: '2 hours ago', opened: true, replied: false },
  { prospect: 'Marcus Rivera', type: 'LinkedIn', sent: '4 hours ago', opened: true, replied: true },
  { prospect: 'Elena Kowalski', type: 'Email', sent: 'Yesterday', opened: false, replied: false },
  { prospect: 'James Okafor', type: 'Email', sent: 'Yesterday', opened: true, replied: false },
];

export default function LeadGenPage() {
  const [tab, setTab] = useState<'prospects' | 'outreach' | 'settings'>('prospects');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={eyebrowStyle}>Lead Generation · Apex Studio</div>
          <h1 style={headingStyle}>Lead Pipeline</h1>
          <p style={subtextStyle}>AI-scored prospects based on your industry and ideal client profile.</p>
        </div>
        <button style={primaryBtnStyle}>Run New Scan</button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <KPI label="Prospects Scored" value="23" />
        <KPI label="Outreach Sent" value="8" />
        <KPI label="Open Rate" value="62%" color="#50C878" />
        <KPI label="Reply Rate" value="12.5%" color="#F5CE00" />
      </div>

      {/* Progress */}
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Pipeline Progress</span>
          <span style={{ fontSize: 11, color: '#F5CE00', fontWeight: 600 }}>64%</span>
        </div>
        <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: '64%', height: '100%', background: 'linear-gradient(90deg, #F5CE00, #C4941A)', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['prospects', 'outreach', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              color: tab === t ? '#F5CE00' : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: tab === t ? 700 : 400,
              cursor: 'pointer',
              borderBottom: tab === t ? '2px solid #F5CE00' : '2px solid transparent',
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'prospects' && <ProspectsTable />}
      {tab === 'outreach' && <OutreachTable />}
      {tab === 'settings' && <SettingsPanel />}
    </div>
  );
}

function ProspectsTable() {
  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr', gap: 12, padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        {['Name', 'Company', 'Industry', 'Score', 'Status'].map((h) => (
          <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{h}</div>
        ))}
      </div>
      {/* Rows */}
      {PROSPECTS.map((p) => (
        <div
          key={p.name}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{p.name}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{p.company}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{p.industry}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: p.score >= 80 ? '#50C878' : p.score >= 70 ? '#F5CE00' : 'rgba(255,255,255,0.5)' }}>
            {p.score}
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: p.status === 'hot' ? 'rgba(80,200,120,0.15)' : p.status === 'warm' ? 'rgba(245,206,0,0.12)' : 'rgba(255,255,255,0.06)',
              color: p.status === 'hot' ? '#50C878' : p.status === 'warm' ? '#F5CE00' : 'rgba(255,255,255,0.5)',
            }}
          >
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function OutreachTable() {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: 12, padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        {['Prospect', 'Channel', 'Sent', 'Opened', 'Replied'].map((h) => (
          <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{h}</div>
        ))}
      </div>
      {OUTREACH.map((o) => (
        <div
          key={o.prospect}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr',
            gap: 12,
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{o.prospect}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{o.type}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{o.sent}</div>
          <div style={{ fontSize: 12, color: o.opened ? '#50C878' : 'rgba(255,255,255,0.3)' }}>{o.opened ? '✓' : '—'}</div>
          <div style={{ fontSize: 12, color: o.replied ? '#F5CE00' : 'rgba(255,255,255,0.3)' }}>{o.replied ? '✓' : '—'}</div>
        </div>
      ))}
    </div>
  );
}

function SettingsPanel() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      <div style={cardStyle}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
          Ideal Client Profile
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Industries</label>
          <input defaultValue="Design, Branding, Creative Agency" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Company Size</label>
          <input defaultValue="2-50 employees" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Location</label>
          <input defaultValue="United States, Canada" style={inputStyle} />
        </div>
      </div>
      <div style={cardStyle}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
          Outreach Settings
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Daily Limit</label>
          <input defaultValue="10" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Channels</label>
          <input defaultValue="Email, LinkedIn" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Follow-up After</label>
          <input defaultValue="3 days" style={inputStyle} />
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
const primaryBtnStyle: React.CSSProperties = { background: '#F5CE00', color: '#0A0A0A', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#fff', fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: 'none' };
