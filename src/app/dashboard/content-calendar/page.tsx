'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ContentItem = {
  id: string;
  day: string;
  platform: 'Instagram' | 'LinkedIn' | 'TikTok' | 'Twitter' | 'YouTube';
  type: 'Carousel' | 'Reel' | 'Story' | 'Post' | 'Video' | 'Thread';
  topic: string;
  status: 'scheduled' | 'draft' | 'generated' | 'published';
  time?: string;
};

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SAMPLE_CALENDAR: ContentItem[] = [
  { id: '1', day: 'Mon', platform: 'Instagram', type: 'Carousel', topic: 'Brand story — how it started', status: 'generated', time: '10:00am' },
  { id: '2', day: 'Mon', platform: 'LinkedIn', type: 'Post', topic: 'Agency positioning thought piece', status: 'draft', time: '12:00pm' },
  { id: '3', day: 'Tue', platform: 'TikTok', type: 'Reel', topic: 'Behind the scenes — brand build', status: 'scheduled', time: '2:00pm' },
  { id: '4', day: 'Tue', platform: 'Instagram', type: 'Story', topic: 'Client win announcement', status: 'draft', time: '5:00pm' },
  { id: '5', day: 'Wed', platform: 'LinkedIn', type: 'Post', topic: 'Case study: Northwind rebrand', status: 'scheduled', time: '9:00am' },
  { id: '6', day: 'Wed', platform: 'YouTube', type: 'Video', topic: 'Process breakdown — logo design', status: 'draft', time: '3:00pm' },
  { id: '7', day: 'Thu', platform: 'Instagram', type: 'Reel', topic: 'Color theory in branding', status: 'scheduled', time: '11:00am' },
  { id: '8', day: 'Thu', platform: 'Twitter', type: 'Thread', topic: '5 mistakes brands make early', status: 'generated', time: '1:00pm' },
  { id: '9', day: 'Fri', platform: 'Instagram', type: 'Carousel', topic: 'Font pairing guide', status: 'scheduled', time: '10:00am' },
  { id: '10', day: 'Fri', platform: 'TikTok', type: 'Reel', topic: 'Rapid brand critique', status: 'draft', time: '4:00pm' },
  { id: '11', day: 'Sat', platform: 'Instagram', type: 'Story', topic: 'Weekend creative inspiration', status: 'scheduled', time: '11:00am' },
  { id: '12', day: 'Sun', platform: 'LinkedIn', type: 'Post', topic: 'Weekly reflection + wins', status: 'scheduled', time: '6:00pm' },
];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: '#E1306C',
  LinkedIn: '#0A66C2',
  TikTok: '#fff',
  Twitter: '#1DA1F2',
  YouTube: '#FF0000',
};

export default function ContentCalendarPage() {
  const router = useRouter();
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const _ = null; // placeholder for removed state

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={eyebrowStyle}>Content Calendar · Apex Studio</div>
          <h1 style={headingStyle}>Content Calendar</h1>
          <p style={subtextStyle}>AI-generated content plan across all platforms. Week of May 26 – Jun 1.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/dashboard/content-calendar/new')} style={primaryBtnStyle}>
            + New Calendar
          </button>
          <button onClick={() => router.push('/dashboard/content-calendar/video')} style={ghostBtnStyle}>
            Video Studio →
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
        <StatCard label="Scheduled" value="7" color="#50C878" />
        <StatCard label="Drafts" value="4" color="#F5CE00" />
        <StatCard label="Generated" value="2" color="#C4941A" />
        <StatCard label="Published" value="0" color="rgba(255,255,255,0.4)" />
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {(['calendar', 'list'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              color: view === v ? '#F5CE00' : 'rgba(255,255,255,0.5)',
              fontSize: 12,
              fontWeight: view === v ? 700 : 400,
              cursor: 'pointer',
              borderBottom: view === v ? '2px solid #F5CE00' : '2px solid transparent',
              fontFamily: "'DM Sans', sans-serif",
              textTransform: 'capitalize',
            }}
          >
            {v} View
          </button>
        ))}
      </div>

      {/* Content */}
      {view === 'calendar' ? <CalendarView items={SAMPLE_CALENDAR} /> : <ListView items={SAMPLE_CALENDAR} />}
    </div>
  );
}

function CalendarView({ items }: { items: ContentItem[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
      {/* Day headers */}
      {WEEK_DAYS.map((d) => (
        <div key={d} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textAlign: 'center', padding: '8px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {d}
        </div>
      ))}
      {/* Day cells */}
      {WEEK_DAYS.map((day) => {
        const dayItems = items.filter((i) => i.day === day);
        return (
          <div
            key={day}
            style={{
              background: '#141414',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
              padding: '10px',
              minHeight: 140,
            }}
          >
            {dayItems.length === 0 && (
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 40 }}>No content</div>
            )}
            {dayItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  padding: '8px',
                  marginBottom: 6,
                  borderLeft: `3px solid ${PLATFORM_COLORS[item.platform] || '#fff'}`,
                }}
              >
                <div style={{ fontSize: 9, color: PLATFORM_COLORS[item.platform], fontWeight: 600, marginBottom: 3 }}>
                  {item.platform} · {item.type}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
                  {item.topic}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{item.time}</div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function ListView({ items }: { items: ContentItem[] }) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1.5fr 1fr 2fr 1fr 1fr', gap: 12, padding: '0 0 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 8 }}>
        {['Day', 'Topic', 'Platform', 'Type', 'Time', 'Status'].map((h) => (
          <div key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{h}</div>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'grid',
            gridTemplateColumns: '0.5fr 1.5fr 1fr 2fr 1fr 1fr',
            gap: 12,
            padding: '10px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{item.day}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>{item.topic}</div>
          <div style={{ fontSize: 11, color: PLATFORM_COLORS[item.platform] }}>{item.platform}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{item.type}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.time}</div>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              background: item.status === 'scheduled' ? 'rgba(80,200,120,0.15)' : item.status === 'generated' ? 'rgba(245,206,0,0.12)' : 'rgba(255,255,255,0.06)',
              color: item.status === 'scheduled' ? '#50C878' : item.status === 'generated' ? '#F5CE00' : 'rgba(255,255,255,0.5)',
            }}
          >
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
const primaryBtnStyle: React.CSSProperties = { background: '#F5CE00', color: '#0A0A0A', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const ghostBtnStyle: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 6, fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
