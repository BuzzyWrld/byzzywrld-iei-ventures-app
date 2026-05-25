// IEI Ventures — Onboarding (Full 4-Question Flow)
// Route: /onboarding

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Audience = 'solo' | 'agency';
type BrandCount = 'one' | 'multiple';
type DashboardChoice = 'yes' | 'maybe-later';

interface OnboardingAnswers {
  audience?: Audience;
  brandCount?: BrandCount;
  needsDashboard?: DashboardChoice;
  techStack: string[];
}

const TOTAL_STEPS = 4;

const TECH_STACK_OPTIONS = [
  'Notion',
  'Airtable',
  'Google Workspace',
  'Slack',
  'Asana',
  'ClickUp',
  'Monday',
  'HubSpot',
  'Salesforce',
  'Mailchimp',
  'Beehiiv',
  'Substack',
  'Webflow',
  'Squarespace',
  'Shopify',
  'Stripe',
  'QuickBooks',
  'Zapier',
  'Make',
  'n8n',
  'Other / Building from scratch',
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    techStack: [],
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const progress = step / TOTAL_STEPS;

  function update(patch: Partial<OnboardingAnswers>) {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }

  function toggleTool(tool: string) {
    setAnswers((prev) => ({
      ...prev,
      techStack: prev.techStack.includes(tool)
        ? prev.techStack.filter((t) => t !== tool)
        : [...prev.techStack, tool],
    }));
  }

  function back() {
    if (step > 1) setStep(step - 1);
    else router.push('/signup');
  }

  async function next() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }
    // Final submit
    setSaving(true);
    setErr('');
    try {
      const res = await fetch('/api/onboarding/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ intent: answers }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      router.push('/new');
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  const canProceed = (() => {
    if (step === 1) return !!answers.audience;
    if (step === 2) return !!answers.brandCount;
    if (step === 3) return !!answers.needsDashboard;
    if (step === 4) return true;
    return false;
  })();

  return (
    <div
      style={{
        background: '#0A0A0A',
        color: '#fff',
        minHeight: '100vh',
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* ============ TOP NAV ============ */}
      <div
        style={{
          padding: '14px 32px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 22,
              height: 22,
              border: '1.5px solid #F5CE00',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 700,
              color: '#F5CE00',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            IEI
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: 13,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Ventures
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Step {step} of {TOTAL_STEPS}
          </span>
          <div
            style={{
              width: 140,
              height: 3,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: '100%',
                background: '#F5CE00',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      </div>

      {/* ============ QUESTION CONTENT ============ */}
      <div style={{ padding: '44px 56px', maxWidth: 760, margin: '0 auto' }}>
        {step === 1 && (
          <Q1Audience
            value={answers.audience}
            onChange={(v) => update({ audience: v })}
          />
        )}
        {step === 2 && (
          <Q2BrandCount
            value={answers.brandCount}
            audience={answers.audience}
            onChange={(v) => update({ brandCount: v })}
          />
        )}
        {step === 3 && (
          <Q3Dashboard
            value={answers.needsDashboard}
            audience={answers.audience}
            onChange={(v) => update({ needsDashboard: v })}
          />
        )}
        {step === 4 && (
          <Q4TechStack
            value={answers.techStack}
            onToggle={toggleTool}
          />
        )}

        {err && (
          <p style={{ fontSize: 12, color: '#F87171', marginTop: 16 }}>
            {err}
          </p>
        )}

        {/* Footer buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 32,
          }}
        >
          <button onClick={back} style={ghostBtnStyle}>
            Back
          </button>
          <button
            onClick={next}
            disabled={!canProceed || saving}
            style={{
              ...primaryBtnStyle,
              opacity: !canProceed || saving ? 0.5 : 1,
              cursor: !canProceed || saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving
              ? 'Saving...'
              : step === TOTAL_STEPS
              ? 'Finish and start building'
              : 'Next question'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// QUESTION 1
// ============================================
function Q1Audience({
  value,
  onChange,
}: {
  value?: Audience;
  onChange: (v: Audience) => void;
}) {
  return (
    <>
      <Eyebrow>Onboarding · Question 1 of 4</Eyebrow>
      <Heading>Who are you building for?</Heading>
      <Subtitle>
        This shapes everything. Your dashboard, your tools, even how the
        platform talks to you.
      </Subtitle>
      <Grid2>
        <ChoiceCard
          selected={value === 'solo'}
          onClick={() => onChange('solo')}
          title="For myself"
          description="I'm building one brand. My own business or project."
          tags={['Founder', 'Solo']}
        />
        <ChoiceCard
          selected={value === 'agency'}
          onClick={() => onChange('agency')}
          title="For my clients"
          description="I'm an agency, freelancer, or consultant building brands for others."
          tags={['Agency', 'Multi brand']}
        />
      </Grid2>
      <InfoCard
        title="Why we ask"
        body="Agencies get a multi tenant workspace with white label assets and per client folders. Founders get a single focused workspace with deeper brand and growth tools. We don't make you choose your dashboard. We build it from this answer."
      />
    </>
  );
}

// ============================================
// QUESTION 2
// ============================================
function Q2BrandCount({
  value,
  audience,
  onChange,
}: {
  value?: BrandCount;
  audience?: Audience;
  onChange: (v: BrandCount) => void;
}) {
  return (
    <>
      <Eyebrow>Onboarding · Question 2 of 4</Eyebrow>
      <Heading>How many brands will you build?</Heading>
      <Subtitle>
        {audience === 'agency'
          ? 'Most agencies juggle multiple. Pick what fits your reality today.'
          : "You can always add more later. We're asking so we set up the right workspace from day one."}
      </Subtitle>
      <Grid2>
        <ChoiceCard
          selected={value === 'one'}
          onClick={() => onChange('one')}
          title="Just one"
          description="One brand. Deep focus. All my energy on a single business or project."
          tags={['Focused', 'Single brand']}
        />
        <ChoiceCard
          selected={value === 'multiple'}
          onClick={() => onChange('multiple')}
          title="Multiple brands"
          description={
            audience === 'agency'
              ? 'Multiple client brands, each with their own workspace and assets.'
              : 'A portfolio of businesses, side projects, or labels I run.'
          }
          tags={['Portfolio', 'Multi workspace']}
        />
      </Grid2>
      <InfoCard
        title="What changes"
        body="Multiple brands unlocks a workspace switcher, isolated asset libraries per brand, and per-brand billing. Single brand gets a tighter, focused dashboard with no switcher clutter."
      />
    </>
  );
}

// ============================================
// QUESTION 3
// ============================================
function Q3Dashboard({
  value,
  audience,
  onChange,
}: {
  value?: DashboardChoice;
  audience?: Audience;
  onChange: (v: DashboardChoice) => void;
}) {
  return (
    <>
      <Eyebrow>Onboarding · Question 3 of 4</Eyebrow>
      <Heading>Want a custom CRM and dashboard for this brand?</Heading>
      <Subtitle>
        {audience === 'agency'
          ? 'A workspace built around how your agency actually runs. Client pipelines, deal tracking, brand asset library, all configured to your business.'
          : 'A workspace built around how your business actually runs. Lead pipeline, project tracker, content calendar, all configured to your business type.'}
      </Subtitle>
      <Grid2>
        <ChoiceCard
          selected={value === 'yes'}
          onClick={() => onChange('yes')}
          title="Yes, build it"
          description="Configure a custom CRM and dashboard based on my brand data. Active from day one."
          tags={['Recommended', 'Custom build']}
        />
        <ChoiceCard
          selected={value === 'maybe-later'}
          onClick={() => onChange('maybe-later')}
          title="Maybe later"
          description="Just the brand foundation for now. I'll explore the dashboard tools after I see the brand."
          tags={['Brand only', 'Add later']}
        />
      </Grid2>
      <InfoCard
        title="What we'll configure"
        body={
          audience === 'agency'
            ? 'A client pipeline kanban, a brand library per client, an invoice tracker, a referral pipeline, and a lead gen radar. All pre-populated with your agency name and brand colors.'
            : "A lead pipeline matched to your business type, a content calendar, a client tracker, an invoice log, and a lead gen radar. All pre-populated with your brand colors and tone."
        }
      />
    </>
  );
}

// ============================================
// QUESTION 4
// ============================================
function Q4TechStack({
  value,
  onToggle,
}: {
  value: string[];
  onToggle: (tool: string) => void;
}) {
  return (
    <>
      <Eyebrow>Onboarding · Question 4 of 4</Eyebrow>
      <Heading>What tools are you already using?</Heading>
      <Subtitle>
        Optional. Pick what applies. We&apos;ll connect to what you have and
        recommend the rest based on what you don&apos;t.
      </Subtitle>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {TECH_STACK_OPTIONS.map((tool) => {
          const selected = value.includes(tool);
          return (
            <span
              key={tool}
              onClick={() => onToggle(tool)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 20,
                fontSize: 13,
                background: selected
                  ? 'rgba(245,206,0,0.12)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${
                  selected ? '#F5CE00' : 'rgba(255,255,255,0.1)'
                }`,
                color: selected ? '#F5CE00' : 'rgba(255,255,255,0.7)',
                fontWeight: selected ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s',
                userSelect: 'none',
              }}
            >
              {selected && '✓ '}
              {tool}
            </span>
          );
        })}
      </div>
      <InfoCard
        title="Why we ask"
        body="If you already use Beehiiv, we won't push you onto a different newsletter platform. If you don't have a CRM, we'll set one up. The goal is to slot into your stack, not replace it."
      />
    </>
  );
}

// ============================================
// SHARED PRIMITIVES
// ============================================
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: '#F5CE00',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 36,
        fontWeight: 700,
        lineHeight: 1.1,
        margin: '12px 0 14px',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.55)',
        lineHeight: 1.6,
        maxWidth: 580,
        marginBottom: 32,
      }}
    >
      {children}
    </p>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginBottom: 28,
      }}
    >
      {children}
    </div>
  );
}

function ChoiceCard({
  selected,
  onClick,
  title,
  description,
  tags,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  tags: string[];
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: selected
          ? 'rgba(245,206,0,0.08)'
          : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected ? '#F5CE00' : 'rgba(255,255,255,0.08)'}`,
        padding: '20px 22px',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: '#fff',
          marginBottom: 6,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      >
        {description}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {tags.map((t) => (
          <span
            key={t}
            style={{
              display: 'inline-block',
              padding: '3px 9px',
              borderRadius: 3,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              background: 'rgba(245,206,0,0.12)',
              border: '1px solid rgba(245,206,0,0.3)',
              color: '#F5CE00',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        background: 'rgba(245,206,0,0.06)',
        border: '1px solid rgba(245,206,0,0.25)',
        borderRadius: 8,
        padding: '18px 22px',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 14, color: '#F5CE00', marginTop: 2 }}>ⓘ</span>
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 4,
              color: '#fff',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6,
            }}
          >
            {body}
          </div>
        </div>
      </div>
    </div>
  );
}

const ghostBtnStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#fff',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '12px 22px',
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

const primaryBtnStyle: React.CSSProperties = {
  background: '#F5CE00',
  color: '#0A0A0A',
  border: 'none',
  padding: '12px 22px',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 13,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  letterSpacing: '0.2px',
};
