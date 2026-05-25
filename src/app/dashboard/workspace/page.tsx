'use client';

import { useState } from 'react';

const MODULES = [
  {
    id: 'lead_pipeline',
    icon: '⊙',
    name: 'Lead Pipeline',
    description: 'Track prospects from discovery to conversion',
    configured: true,
    items: 23,
  },
  {
    id: 'client_tracker',
    icon: '◇',
    name: 'Client Tracker',
    description: 'Active clients, projects, and deliverables',
    configured: true,
    items: 4,
  },
  {
    id: 'content_calendar',
    icon: '◬',
    name: 'Content Calendar',
    description: 'Plan and schedule your brand content',
    configured: true,
    items: 12,
  },
  {
    id: 'invoice_log',
    icon: '▥',
    name: 'Invoice Log',
    description: 'Track invoices, payments, and outstanding balances',
    configured: true,
    items: 7,
  },
  {
    id: 'lead_gen_radar',
    icon: '◐',
    name: 'Lead Gen Radar',
    description: 'Real-time prospect scoring and alerts',
    configured: true,
    items: 5,
  },
];

const PIPELINE_STAGES = [
  { name: 'Discovered', count: 12, color: 'rgba(255,255,255,0.3)' },
  { name: 'Contacted', count: 8, color: '#F5CE00' },
  { name: 'Replied', count: 4, color: '#C4941A' },
  { name: 'Meeting Set', count: 2, color: '#50C878' },
  { name: 'Closed', count: 1, color: '#50C878' },
];

const UPCOMING = [
  { title: 'Instagram carousel — brand story', date: 'Tomorrow', module: 'Content Calendar' },
  { title: 'Follow up: Sarah Chen', date: 'May 27', module: 'Lead Pipeline' },
  { title: 'Invoice #007 due', date: 'May 28', module: 'Invoice Log' },
  { title: 'LinkedIn post — case study', date: 'May 29', module: 'Content Calendar' },
  { title: 'Review: Northwind Labs proposal', date: 'May 30', module: 'Client Tracker' },
];

export default function WorkspacePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Business Workspace · Apex Studio</div>
        <h1 style={headingStyle}>Command Center</h1>
        <p style={subtextStyle}>5 modules configured. Everything you need to run and grow your business.</p>
      </div>

      {/* Module grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        {MODULES.map((m) => (
          <div
            key={m.id}
            onClick={() => setActiveModule(activeModule === m.id ? null : m.id)}
            style={{
              ...cardStyle,
              cursor: 'pointer',
              border: activeModule === m.id ? '1px solid #F5CE00' : '1px solid rgba(255,255,255,0.08)',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span style={{ fontSize: 11, color: '#F5CE00', fontWeight: 600 }}>{m.items}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{m.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{m.description}</div>
          </div>
        ))}
      </div>

      {/* Two column: Pipeline + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Pipeline funnel */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
            Pipeline Funnel
          </div>
          {PIPELINE_STAGES.map((s, i) => (
            <div key={s.name} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{s.name}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.count}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(s.count / 12) * 100}%`,
                    height: '100%',
                    background: s.color,
                    borderRadius: 2,
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: '12px', background: 'rgba(245,206,0,0.06)', borderRadius: 6, border: '1px solid rgba(245,206,0,0.15)' }}>
            <div style={{ fontSize: 11, color: '#F5CE00', fontWeight: 600 }}>Conversion Rate</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>8.3%</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>1 closed from 12 discovered</div>
          </div>
        </div>

        {/* Upcoming */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
            Upcoming Tasks
          </div>
          {UPCOMING.map((u, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', marginBottom: 3 }}>{u.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{u.module}</div>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{u.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue snapshot */}
      <div style={{ ...cardStyle, marginTop: 16 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
          Revenue Snapshot
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>This Month</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#50C878', fontFamily: "'Space Grotesk', sans-serif" }}>$4,200</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Outstanding</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F5CE00', fontFamily: "'Space Grotesk', sans-serif" }}>$1,850</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Active Clients</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>4</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Avg Project Value</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}>$1,050</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
