'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Step = 'intake' | 'analysis' | 'week_1' | 'review_1' | 'week_2' | 'review_2' | 'week_3' | 'review_3' | 'week_4' | 'review_4' | 'complete';

const STEPS: { id: Step; label: string; description: string }[] = [
  { id: 'intake', label: 'Content Intake', description: 'Define your goals, audience, and platforms' },
  { id: 'analysis', label: 'Market Analysis', description: 'AI analyzes competitors, trends, and opportunities' },
  { id: 'week_1', label: 'Week 1 Generation', description: 'AI generates Week 1 content plan' },
  { id: 'review_1', label: 'Week 1 Review', description: 'Human check-in — approve, edit, or regenerate' },
  { id: 'week_2', label: 'Week 2 Generation', description: 'AI generates Week 2 based on feedback' },
  { id: 'review_2', label: 'Week 2 Review', description: 'Human check-in — approve, edit, or regenerate' },
  { id: 'week_3', label: 'Week 3 Generation', description: 'AI generates Week 3 content plan' },
  { id: 'review_3', label: 'Week 3 Review', description: 'Human check-in — approve, edit, or regenerate' },
  { id: 'week_4', label: 'Week 4 Generation', description: 'AI generates Week 4 content plan' },
  { id: 'review_4', label: 'Week 4 Review', description: 'Final review — approve full calendar' },
  { id: 'complete', label: 'Calendar Ready', description: '84 assets across 4 weeks, ready to schedule' },
];

export default function NewCalendarPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('intake');
  const [processing, setProcessing] = useState(false);

  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  const advance = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      const next = STEPS[currentIndex + 1];
      if (next) setCurrentStep(next.id);
    }, 2000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <div style={eyebrowStyle}>New Content Calendar · Apex Studio</div>
          <h1 style={headingStyle}>Create Content Calendar</h1>
          <p style={subtextStyle}>
            {STEPS[currentIndex].description}
          </p>
        </div>
        <button onClick={() => router.push('/dashboard/content-calendar')} style={ghostBtnStyle}>
          ← Back
        </button>
      </div>

      {/* Progress rail */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            Step {currentIndex + 1} of {STEPS.length}
          </span>
          <span style={{ fontSize: 11, color: '#F5CE00', fontWeight: 600 }}>
            {Math.round(((currentIndex) / (STEPS.length - 1)) * 100)}%
          </span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #F5CE00, #C4941A)',
              borderRadius: 2,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Two column: Steps rail + Active step */}
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 20 }}>
        {/* Step list */}
        <div style={cardStyle}>
          {STEPS.map((step, i) => {
            const isActive = step.id === currentStep;
            const isDone = i < currentIndex;
            return (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 10px',
                  borderRadius: 5,
                  background: isActive ? 'rgba(245,206,0,0.08)' : 'transparent',
                  marginBottom: 2,
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: isDone ? 'none' : isActive ? '2px solid #F5CE00' : '1.5px solid rgba(255,255,255,0.15)',
                    background: isDone ? '#50C878' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 9,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {isDone && '✓'}
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: isActive ? '#F5CE00' : isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.5)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Active step content */}
        <div style={cardStyle}>
          {currentStep === 'intake' && <IntakeStep />}
          {currentStep === 'analysis' && <AnalysisStep />}
          {currentStep.startsWith('week_') && <WeekGenerationStep week={currentStep.replace('week_', '')} />}
          {currentStep.startsWith('review_') && <ReviewStep week={currentStep.replace('review_', '')} />}
          {currentStep === 'complete' && <CompleteStep onFinish={() => router.push('/dashboard/content-calendar')} />}

          {/* Action buttons */}
          {currentStep !== 'complete' && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button onClick={advance} style={primaryBtnStyle} disabled={processing}>
                {processing ? '◐ Processing...' : currentStep === 'intake' ? 'Start Analysis' : currentStep === 'analysis' ? 'Generate Week 1' : currentStep.startsWith('review_') ? 'Approve & Continue' : 'Continue'}
              </button>
              {currentStep.startsWith('review_') && (
                <button style={ghostBtnStyle}>Request Changes</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IntakeStep() {
  return (
    <div>
      <h2 style={stepHeading}>Content Strategy Intake</h2>
      <p style={stepText}>Tell us about your content goals so we can generate a tailored 4-week calendar.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 20 }}>
        <div>
          <label style={labelStyle}>Primary Goal</label>
          <select style={inputStyle} defaultValue="awareness">
            <option value="awareness">Brand Awareness</option>
            <option value="leads">Lead Generation</option>
            <option value="engagement">Community Engagement</option>
            <option value="sales">Direct Sales</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Industry</label>
          <input style={inputStyle} defaultValue="Design & Branding" />
        </div>
        <div>
          <label style={labelStyle}>Target Audience</label>
          <input style={inputStyle} defaultValue="Founders, startups, small businesses" />
        </div>
        <div>
          <label style={labelStyle}>Competitors to Analyze</label>
          <input style={inputStyle} placeholder="e.g. @competitor1, @competitor2" />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Platforms</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Instagram', 'LinkedIn', 'TikTok', 'Twitter', 'YouTube'].map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={['Instagram', 'LinkedIn', 'TikTok'].includes(p)} />
              {p}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Brand Voice / Tone</label>
        <textarea style={{ ...inputStyle, minHeight: 60 }} defaultValue="Confident, creative, direct. Avoid corporate jargon." />
      </div>

      <div style={{ marginTop: 14 }}>
        <label style={labelStyle}>Topics / Themes to Cover</label>
        <textarea style={{ ...inputStyle, minHeight: 60 }} placeholder="e.g. brand storytelling, design process, client transformations, industry trends..." />
      </div>
    </div>
  );
}

function AnalysisStep() {
  return (
    <div>
      <h2 style={stepHeading}>Market Analysis</h2>
      <p style={stepText}>AI is analyzing your competitors, industry trends, and content gaps.</p>

      <div style={{ marginTop: 20 }}>
        {[
          { label: 'Competitor audit', status: 'done', detail: 'Analyzed 3 competitors across 4 platforms' },
          { label: 'Trend identification', status: 'done', detail: 'Found 12 trending topics in Design & Branding' },
          { label: 'Content gap analysis', status: 'done', detail: '8 underserved topics identified' },
          { label: 'Optimal posting schedule', status: 'done', detail: 'Best times: Mon/Wed/Fri 10am, Tue/Thu 2pm' },
          { label: 'Cross-referencing with brand voice', status: 'done', detail: 'Matched 94% compatibility score' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#50C878', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0, marginTop: 2 }}>✓</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: 14, background: 'rgba(245,206,0,0.06)', borderRadius: 6, border: '1px solid rgba(245,206,0,0.15)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#F5CE00', marginBottom: 6 }}>Key Insight</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          Your strongest opportunity is educational content about brand strategy — competitors post mainly portfolio work but rarely teach. This gap represents ~3x engagement potential based on trending topics in your niche.
        </div>
      </div>
    </div>
  );
}

function WeekGenerationStep({ week }: { week: string }) {
  const dayCount = 7;
  const postsPerDay = 2;
  return (
    <div>
      <h2 style={stepHeading}>Generating Week {week}</h2>
      <p style={stepText}>AI is creating {dayCount * postsPerDay} content pieces for Week {week}.</p>

      <div style={{ marginTop: 20 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: i < 4 ? '#50C878' : 'transparent', border: i >= 4 ? '1.5px solid rgba(255,255,255,0.2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff' }}>
              {i < 4 ? '✓' : ''}
            </div>
            <span style={{ fontSize: 12, color: i < 4 ? 'rgba(255,255,255,0.4)' : '#fff' }}>
              {['Script drafts', 'Visual direction', 'Captions & hashtags', 'Scheduling slots', 'Final formatting'][i]}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(80,200,120,0.08)', border: '1px solid rgba(80,200,120,0.2)', borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: '#50C878' }}>
          {postsPerDay * dayCount} posts generated for Week {week} — ready for review
        </div>
      </div>
    </div>
  );
}

function ReviewStep({ week }: { week: string }) {
  const samplePosts = [
    { platform: 'Instagram', type: 'Carousel', topic: 'Why most startups get branding wrong', approved: false },
    { platform: 'LinkedIn', type: 'Post', topic: 'The 3 brand principles every founder needs', approved: false },
    { platform: 'TikTok', type: 'Reel', topic: 'Brand critique in 30 seconds', approved: false },
    { platform: 'Instagram', type: 'Reel', topic: 'Our design process (BTS)', approved: false },
    { platform: 'Twitter', type: 'Thread', topic: 'How color psychology drives conversions', approved: false },
  ];

  return (
    <div>
      <h2 style={stepHeading}>Week {week} Review</h2>
      <p style={stepText}>Review the generated content. Approve, edit, or request changes before moving on.</p>

      <div style={{ marginTop: 20 }}>
        {samplePosts.map((post, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 6,
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{post.topic}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{post.platform} · {post.type}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...miniBtn, background: 'rgba(80,200,120,0.15)', color: '#50C878', border: '1px solid rgba(80,200,120,0.3)' }}>Approve</button>
              <button style={{ ...miniBtn, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>Edit</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(245,206,0,0.06)', border: '1px solid rgba(245,206,0,0.15)', borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: '#F5CE00' }}>
          0/{samplePosts.length} approved — approve all or individual items to continue
        </div>
      </div>
    </div>
  );
}

function CompleteStep({ onFinish }: { onFinish: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <h2 style={{ ...stepHeading, textAlign: 'center' }}>Calendar Complete</h2>
      <p style={{ ...stepText, textAlign: 'center', marginBottom: 24 }}>
        84 content pieces across 4 weeks, ready to schedule and publish.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={onFinish} style={primaryBtnStyle}>
          View Calendar
        </button>
        <button style={ghostBtnStyle}>Export All</button>
      </div>
    </div>
  );
}

const miniBtn: React.CSSProperties = { padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const eyebrowStyle: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' };
const headingStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, margin: '10px 0 6px', fontFamily: "'Space Grotesk', sans-serif" };
const subtextStyle: React.CSSProperties = { fontSize: 13, color: 'rgba(255,255,255,0.5)' };
const stepHeading: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 6 };
const stepText: React.CSSProperties = { fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 };
const cardStyle: React.CSSProperties = { background: '#141414', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '18px 20px' };
const primaryBtnStyle: React.CSSProperties = { background: '#F5CE00', color: '#0A0A0A', border: 'none', padding: '10px 18px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const ghostBtnStyle: React.CSSProperties = { background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: 6, fontWeight: 500, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, color: '#fff', fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: 'none' };
