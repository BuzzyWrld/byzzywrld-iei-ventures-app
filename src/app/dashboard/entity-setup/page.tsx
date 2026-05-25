'use client';

import { useState } from 'react';

const ENTITY_TYPES = [
  {
    type: 'LLC',
    name: 'Limited Liability Company',
    description: 'Best for most small businesses. Personal asset protection with flexible taxation.',
    cost: '$199',
    timeline: '3-5 business days',
    recommended: true,
    features: ['Personal liability protection', 'Pass-through taxation', 'Flexible management', 'Fewer formalities than corp'],
  },
  {
    type: 'S-Corp',
    name: 'S Corporation',
    description: 'Ideal when you want to save on self-employment tax with salary + distributions.',
    cost: '$399',
    timeline: '5-7 business days',
    recommended: false,
    features: ['Self-employment tax savings', 'Salary + distribution structure', 'Limited to 100 shareholders', 'Pass-through taxation'],
  },
  {
    type: 'C-Corp',
    name: 'C Corporation',
    description: 'Best for raising venture capital or going public eventually.',
    cost: '$499',
    timeline: '5-7 business days',
    recommended: false,
    features: ['Unlimited shareholders', 'Preferred by investors', 'Double taxation (entity + personal)', 'Most formalities required'],
  },
];

const CHECKLIST = [
  { step: 'Choose entity type', done: false },
  { step: 'Confirm registered agent', done: false },
  { step: 'File articles of organization', done: false },
  { step: 'Get EIN from IRS', done: false },
  { step: 'Open business bank account', done: false },
  { step: 'Operating agreement drafted', done: false },
];

export default function EntitySetupPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Entity Setup · Apex Studio</div>
        <h1 style={headingStyle}>Business Formation</h1>
        <p style={subtextStyle}>Protect your brand with the right legal structure. We handle the paperwork.</p>
      </div>

      {/* Current status */}
      <div style={{ ...cardStyle, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Current Status</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#F5CE00' }}>Sole Proprietor</div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(245,206,0,0.08)', padding: '6px 12px', borderRadius: 4 }}>
          Recommended: LLC
        </div>
      </div>

      {/* Entity cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28 }}>
        {ENTITY_TYPES.map((e) => (
          <div
            key={e.type}
            onClick={() => setSelected(e.type)}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              border: selected === e.type
                ? '1px solid #F5CE00'
                : e.recommended
                ? '1px solid rgba(245,206,0,0.3)'
                : '1px solid rgba(255,255,255,0.08)',
              position: 'relative',
            }}
          >
            {e.recommended && (
              <div style={{
                position: 'absolute',
                top: -1,
                right: 12,
                background: '#F5CE00',
                color: '#0A0A0A',
                fontSize: 8,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '0 0 4px 4px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Recommended
              </div>
            )}
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: '#fff', marginBottom: 4 }}>
              {e.type}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>{e.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 14, lineHeight: 1.5 }}>
              {e.description}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#F5CE00' }}>{e.cost}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>one-time</div>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{e.timeline}</div>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {e.features.map((f) => (
                <li key={f} style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#50C878', fontSize: 10 }}>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Formation checklist */}
      <div style={cardStyle}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
          Formation Checklist
        </div>
        {CHECKLIST.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: item.done ? 'none' : '1.5px solid rgba(255,255,255,0.2)',
                background: item.done ? '#50C878' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                color: '#fff',
              }}
            >
              {item.done && '✓'}
            </div>
            <div style={{ fontSize: 12, color: item.done ? 'rgba(255,255,255,0.4)' : '#fff' }}>
              {item.step}
            </div>
          </div>
        ))}
        <button
          style={{
            ...primaryBtnStyle,
            marginTop: 16,
            width: '100%',
            opacity: selected ? 1 : 0.5,
          }}
          disabled={!selected}
        >
          {selected ? `Start ${selected} Formation` : 'Select an entity type above'}
        </button>
      </div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
const primaryBtnStyle: React.CSSProperties = { background: '#F5CE00', color: '#0A0A0A', border: 'none', padding: '12px 18px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
