'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type VideoProject = {
  id: string;
  title: string;
  platform: string;
  duration: string;
  status: 'ready' | 'rendering' | 'queued' | 'draft';
  thumbnail?: string;
};

const PROJECTS: VideoProject[] = [
  { id: 'v1', title: 'Brand Story — How It Started', platform: 'Instagram Reel', duration: '0:30', status: 'ready' },
  { id: 'v2', title: 'Behind the Scenes — Brand Build', platform: 'TikTok', duration: '0:45', status: 'ready' },
  { id: 'v3', title: 'Process Breakdown — Logo Design', platform: 'YouTube Short', duration: '1:20', status: 'rendering' },
  { id: 'v4', title: 'Color Theory in Branding', platform: 'Instagram Reel', duration: '0:25', status: 'queued' },
  { id: 'v5', title: 'Rapid Brand Critique', platform: 'TikTok', duration: '0:40', status: 'draft' },
];

const TEMPLATES = [
  { id: 't1', name: 'Hook → Push → Climax', description: 'Fast-paced brand story structure', duration: '30s' },
  { id: 't2', name: 'Before/After Reveal', description: 'Show transformation with split screen', duration: '15s' },
  { id: 't3', name: 'Talking Head + B-Roll', description: 'Expert commentary with visuals', duration: '60s' },
  { id: 't4', name: 'Text-on-Screen Carousel', description: 'Animated text for key points', duration: '30s' },
  { id: 't5', name: 'Product Showcase', description: 'Hero shot with motion graphics', duration: '15s' },
];

export default function VideoStudioPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateVideo = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={eyebrowStyle}>Video Studio · Apex Studio</div>
          <h1 style={headingStyle}>Video Generator</h1>
          <p style={subtextStyle}>Turn your content calendar items into ready-to-publish videos.</p>
        </div>
        <button onClick={() => router.push('/dashboard/content-calendar')} style={ghostBtnStyle}>
          ← Back to Calendar
        </button>
      </div>

      {/* Generator section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {/* Input panel */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            New Video
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Topic / Script Prompt</label>
            <textarea
              placeholder="e.g. Explain why color theory matters for brand recognition in 30 seconds..."
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Platform</label>
              <select style={inputStyle} defaultValue="instagram">
                <option value="instagram">Instagram Reel</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube Short</option>
                <option value="linkedin">LinkedIn Video</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Duration</label>
              <select style={inputStyle} defaultValue="30">
                <option value="15">15 seconds</option>
                <option value="30">30 seconds</option>
                <option value="45">45 seconds</option>
                <option value="60">60 seconds</option>
                <option value="90">90 seconds</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Voice</label>
            <select style={inputStyle} defaultValue="confident">
              <option value="confident">Confident & Direct</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="authoritative">Authoritative & Expert</option>
              <option value="playful">Playful & Creative</option>
            </select>
          </div>

          <button
            onClick={handleGenerateVideo}
            style={{ ...primaryBtnStyle, width: '100%', padding: '12px' }}
            disabled={generating}
          >
            {generating ? '◐ Generating Video...' : 'Generate Video'}
          </button>
        </div>

        {/* Templates */}
        <div style={cardStyle}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 14 }}>
            Video Templates
          </div>
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTemplate(t.id)}
              style={{
                padding: '12px',
                borderRadius: 6,
                border: selectedTemplate === t.id ? '1px solid #F5CE00' : '1px solid rgba(255,255,255,0.06)',
                background: selectedTemplate === t.id ? 'rgba(245,206,0,0.06)' : 'rgba(255,255,255,0.02)',
                marginBottom: 8,
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{t.description}</div>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {t.duration}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects list */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Video Projects
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            {PROJECTS.filter((p) => p.status === 'ready').length} ready · {PROJECTS.filter((p) => p.status === 'rendering').length} rendering
          </div>
        </div>

        {PROJECTS.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 0',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Thumbnail placeholder */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 6,
                  background: '#1A1A2E',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                }}
              >
                {p.status === 'rendering' ? '◐' : p.status === 'ready' ? '▶' : '◯'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {p.platform} · {p.duration}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 3,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  background: p.status === 'ready' ? 'rgba(80,200,120,0.15)' : p.status === 'rendering' ? 'rgba(245,206,0,0.12)' : 'rgba(255,255,255,0.06)',
                  color: p.status === 'ready' ? '#50C878' : p.status === 'rendering' ? '#F5CE00' : 'rgba(255,255,255,0.4)',
                }}
              >
                {p.status}
              </span>
              {p.status === 'ready' && (
                <button style={ghostBtnSmStyle}>Download</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
const primaryBtnStyle: React.CSSProperties = { background: '#F5CE00', color: '#0A0A0A', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const ghostBtnStyle: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 6, fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const ghostBtnSmStyle: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '5px 10px', borderRadius: 4, fontWeight: 500, fontSize: 10, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#fff', fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: 'none' };
