// IEI Ventures — Dashboard
// Route: /dashboard
//
// This is the home base. The user lands here after the brand engine
// finishes their build. It renders:
//   - Sidebar with workspace nav + add-ons
//   - Header with brand name and build progress
//   - KPI strip (Brand Score, Assets Ready, Leads Surfaced, Site Status)
//   - Module grid (Brand Kit, Website, Lead Gen, Entity Setup)
//   - Recent Activity feed
//
// Module visibility is driven by:
//   1. The user's onboarding intent (audience, brandCount, needsDashboard)
//   2. The dashboardPreset returned from /api/onboarding/save
//   3. The actual brand JSON returned from /api/build/status
//
// Standalone — no external imports beyond React + next/navigation.

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// TYPES — match the brand engine output contract
// ============================================
interface DashboardData {
  brand_json: {
    meta: {
      brand_name: string;
      business_type: string;
      industry: string;
    };
    design_tokens: {
      primary: string;
      secondary: string;
      accent?: string;
      background: string;
      text: string;
      font_heading: string;
      font_body: string;
    };
    copy: {
      tagline: string;
      cta_primary: string;
    };
  };
  asset_urls: {
    playbook_pdf?: string;
    logo_svg?: string;
    logo_dark_svg?: string;
    landing_page?: string;
  };
  preset: string; // founder-single-full, agency-multi-lite, etc.
  modules: {
    id: string;
    status: 'delivered' | 'live' | 'active' | 'recommended' | 'locked';
    data?: Record<string, any>;
  }[];
  kpis: {
    brand_score: number;
    assets_ready: number;
    assets_total: number;
    leads_surfaced: number;
    site_status: 'live' | 'deploying' | 'offline';
  };
  recent_activity: {
    id: string;
    icon: 'check' | 'world' | 'target' | 'alert';
    message: string;
    timestamp: string;
  }[];
  build_progress: number; // 0 to 1
  last_activity_label: string;
  has_brand?: boolean; // false when the user has no brands yet
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const sessionId = getSessionId();
        if (!sessionId) {
          router.push('/signup');
          return;
        }
        const res = await fetch(`/api/dashboard/${sessionId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Dashboard load failed (${res.status})`);
        const json = (await res.json()) as DashboardData;
        setData(json);
      } catch (e: any) {
        setErr(e.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  if (loading) return <DashboardLoading />;
  if (err || !data) return <DashboardError err={err} onRetry={() => location.reload()} />;
  if (data.has_brand === false) return <DashboardEmpty onStart={() => router.push('/new')} />;

  const { brand_json, asset_urls, modules, kpis, recent_activity, build_progress, last_activity_label } = data;
  const brandName = brand_json.meta.brand_name;
  const tokens = brand_json.design_tokens;

  return (
    <div>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 28,
            }}
          >
            <div>
              <Eyebrow>Dashboard · {brandName}</Eyebrow>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  margin: '10px 0 6px',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Welcome back.
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                Your brand build is {Math.round(build_progress * 100)}% complete. {last_activity_label}
              </p>
            </div>
            <button
              onClick={() => router.push('/new')}
              style={primaryBtnStyle}
            >
              + New Brand
            </button>
          </div>

          {/* KPI Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <KPICard
              label="Brand Score"
              value={`${kpis.brand_score}/100`}
              valueColor="#F5CE00"
            />
            <KPICard
              label="Assets Ready"
              value={`${kpis.assets_ready}/${kpis.assets_total}`}
            />
            <KPICard
              label="Leads Surfaced"
              value={String(kpis.leads_surfaced)}
            />
            <KPICard
              label="Site Status"
              value={kpis.site_status === 'live' ? '● Live' : kpis.site_status === 'deploying' ? '◐ Deploying' : '○ Offline'}
              valueColor={kpis.site_status === 'live' ? '#50C878' : kpis.site_status === 'deploying' ? '#F5CE00' : 'rgba(255,255,255,0.5)'}
              small
            />
          </div>

          {/* Module Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
              marginBottom: 20,
            }}
          >
            {modules.map((m) => (
              <ModuleCard
                key={m.id}
                moduleId={m.id}
                status={m.status}
                data={m.data}
                tokens={tokens}
                assetUrls={asset_urls}
              />
            ))}
          </div>

      {/* Recent Activity */}
      <ActivityFeed items={recent_activity} />
    </div>
  );
}

// ============================================
// SIDEBAR
// ============================================
function Sidebar({
  brandName,
  buildProgress,
  preset,
}: {
  brandName: string;
  buildProgress: number;
  preset: string;
}) {
  const isAgency = preset.startsWith('agency');
  const isLite = preset.endsWith('lite');

  const workspaceItems = [
    { icon: '▦', label: 'Overview', active: true },
    { icon: '◐', label: 'Brand Kit' },
    { icon: '◯', label: 'Website' },
    ...(isLite ? [] : [{ icon: '⊙', label: 'Lead Gen' }]),
    ...(isAgency ? [{ icon: '◇', label: 'Clients' }] : []),
  ];

  return (
    <div
      style={{
        background: '#0F0F0F',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 18px',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 30,
          padding: '0 6px',
        }}
      >
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

      {/* Current Brand */}
      <SidebarLabel>Current Brand</SidebarLabel>
      <div
        style={{
          background: 'rgba(245,206,0,0.08)',
          border: '1px solid rgba(245,206,0,0.25)',
          borderRadius: 6,
          padding: '12px 14px',
          marginBottom: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              background: '#F5CE00',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#0A0A0A',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {brandName.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#fff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {brandName}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              Brand build · {Math.round(buildProgress * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <SidebarLabel>Workspace</SidebarLabel>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          marginBottom: 22,
        }}
      >
        {workspaceItems.map((it) => (
          <SidebarItem key={it.label} {...it} />
        ))}
      </div>

      {/* Add-ons */}
      <SidebarLabel>Add ons</SidebarLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SidebarItem icon="◬" label="Domains" />
        <SidebarItem icon="▥" label="Entity Setup" />
      </div>
    </div>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '2px',
        color: 'rgba(255,255,255,0.3)',
        padding: '0 8px',
        marginBottom: 10,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
        borderRadius: 5,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
        color: active ? '#F5CE00' : 'rgba(255,255,255,0.55)',
        fontWeight: active ? 500 : 400,
        cursor: 'pointer',
      }}
    >
      <span>{icon}</span>
      {label}
    </div>
  );
}

// ============================================
// KPI CARD
// ============================================
function KPICard({
  label,
  value,
  valueColor,
  small,
}: {
  label: string;
  value: string;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
        padding: '14px 16px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: 6,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: small ? 14 : 24,
          fontWeight: 700,
          color: valueColor || '#fff',
          fontFamily: "'Space Grotesk', sans-serif",
          marginTop: small ? 4 : 0,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ============================================
// MODULE CARD — renders based on moduleId
// ============================================
function ModuleCard({
  moduleId,
  status,
  data,
  tokens,
  assetUrls,
}: {
  moduleId: string;
  status: 'delivered' | 'live' | 'active' | 'recommended' | 'locked';
  data?: Record<string, any>;
  tokens: DashboardData['brand_json']['design_tokens'];
  assetUrls: DashboardData['asset_urls'];
}) {
  const isLocked = status === 'locked';

  return (
    <div
      style={{
        background: isLocked ? 'rgba(255,255,255,0.02)' : '#181818',
        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 10,
        padding: '18px 22px',
        opacity: isLocked ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <ModuleHeader title={getModuleTitle(moduleId)} status={status} />

      {moduleId === 'brand-kit' && (
        <BrandKitBody tokens={tokens} assetUrls={assetUrls} locked={isLocked} />
      )}
      {moduleId === 'website' && (
        <WebsiteBody assetUrls={assetUrls} locked={isLocked} />
      )}
      {moduleId === 'lead-gen' && (
        <LeadGenBody data={data} locked={isLocked} />
      )}
      {moduleId === 'entity-setup' && (
        <EntitySetupBody locked={isLocked} />
      )}
      {moduleId === 'business-dashboard' && (
        <BusinessDashboardBody data={data} locked={isLocked} />
      )}
      {moduleId === 'domains' && (
        <DomainsBody data={data} locked={isLocked} />
      )}
    </div>
  );
}

function getModuleTitle(id: string): string {
  return {
    'brand-kit': 'Brand Kit',
    'website': 'Website',
    'lead-gen': 'Lead Gen Agent',
    'entity-setup': 'Entity Setup',
    'business-dashboard': 'Business Dashboard',
    'domains': 'Domain Marketplace',
  }[id] || id;
}

function ModuleHeader({
  title,
  status,
}: {
  title: string;
  status: 'delivered' | 'live' | 'active' | 'recommended' | 'locked';
}) {
  const colors = {
    delivered: { bg: 'rgba(80,200,120,0.15)', border: 'rgba(80,200,120,0.3)', color: '#50C878' },
    live: { bg: 'rgba(80,200,120,0.15)', border: 'rgba(80,200,120,0.3)', color: '#50C878' },
    active: { bg: 'rgba(245,206,0,0.12)', border: 'rgba(245,206,0,0.3)', color: '#F5CE00' },
    recommended: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
    locked: { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' },
  };
  const s = colors[status];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        {title}
      </div>
      <span
        style={{
          padding: '3px 9px',
          borderRadius: 3,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          background: s.bg,
          border: `1px solid ${s.border}`,
          color: s.color,
        }}
      >
        {status}
      </span>
    </div>
  );
}

// ============================================
// MODULE BODIES
// ============================================
function BrandKitBody({
  tokens,
  assetUrls,
  locked,
}: {
  tokens: DashboardData['brand_json']['design_tokens'];
  assetUrls: DashboardData['asset_urls'];
  locked: boolean;
}) {
  return (
    <>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[tokens.primary, tokens.secondary, tokens.accent || tokens.background, tokens.background, tokens.text]
          .filter(Boolean)
          .slice(0, 5)
          .map((c, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                background: c,
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          ))}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        {tokens.font_heading} · {tokens.font_body} · Logo system · PDF playbook
      </div>
      {!locked && assetUrls.playbook_pdf && (
        <a
          href={assetUrls.playbook_pdf}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontSize: 11,
            color: '#F5CE00',
            textDecoration: 'none',
          }}
        >
          Download playbook PDF →
        </a>
      )}
    </>
  );
}

function WebsiteBody({
  assetUrls,
  locked,
}: {
  assetUrls: DashboardData['asset_urls'];
  locked: boolean;
}) {
  return (
    <>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: '#F5CE00',
          marginBottom: 6,
        }}
      >
        {assetUrls.landing_page || 'Deploying...'}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
        {locked ? 'Unlock to deploy your site' : 'Deployed. Live now.'}
      </div>
      {!locked && assetUrls.landing_page && (
        <a
          href={assetUrls.landing_page}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-block',
            marginTop: 10,
            fontSize: 11,
            color: '#F5CE00',
            textDecoration: 'none',
          }}
        >
          Open site →
        </a>
      )}
    </>
  );
}

function LeadGenBody({
  data,
  locked,
}: {
  data?: Record<string, any>;
  locked: boolean;
}) {
  const scored = data?.prospects_scored ?? 0;
  const sent = data?.outreach_sent ?? 0;
  const progress = data?.progress ?? 0;
  return (
    <>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
        {locked
          ? 'Find your next clients automatically'
          : `${scored} prospects scored. ${sent} outreach sent.`}
      </div>
      <div
        style={{
          width: '100%',
          height: 4,
          background: 'rgba(255,255,255,0.06)',
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
      {locked && (
        <button
          style={{
            ...ghostBtnSmStyle,
            marginTop: 10,
          }}
        >
          Unlock Lead Gen
        </button>
      )}
    </>
  );
}

function EntitySetupBody({ locked }: { locked: boolean }) {
  return (
    <>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        Form your LLC, S-Corp, or C-Corp. Protect your brand.
      </div>
      <button style={ghostBtnSmStyle}>
        {locked ? 'Unlock' : 'Explore options'}
      </button>
    </>
  );
}

function BusinessDashboardBody({
  data,
  locked,
}: {
  data?: Record<string, any>;
  locked: boolean;
}) {
  const modules = data?.module_count ?? 5;
  return (
    <>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>
        {locked
          ? 'Lead pipeline, client tracker, content calendar'
          : `${modules} modules configured for your business`}
      </div>
      {!locked ? (
        <a
          href="/dashboard/workspace"
          style={{ fontSize: 11, color: '#F5CE00', textDecoration: 'none' }}
        >
          Open workspace →
        </a>
      ) : (
        <button style={ghostBtnSmStyle}>Unlock workspace</button>
      )}
    </>
  );
}

function DomainsBody({
  data,
  locked,
}: {
  data?: Record<string, any>;
  locked: boolean;
}) {
  const suggested = data?.suggested_domain;
  return (
    <>
      {suggested ? (
        <>
          <div
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#F5CE00',
              marginBottom: 6,
            }}
          >
            {suggested}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            Available · $12.99/year
          </div>
        </>
      ) : (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
          Search and purchase a domain in one click.
        </div>
      )}
      <button style={{ ...ghostBtnSmStyle, marginTop: 10 }}>
        {suggested ? 'Buy now' : 'Search domains'}
      </button>
    </>
  );
}

// ============================================
// ACTIVITY FEED
// ============================================
function ActivityFeed({
  items,
}: {
  items: DashboardData['recent_activity'];
}) {
  const iconMap = {
    check: { char: '✓', color: '#50C878' },
    world: { char: '◯', color: '#F5CE00' },
    target: { char: '⊙', color: '#F5CE00' },
    alert: { char: '!', color: '#F87171' },
  };

  return (
    <div
      style={{
        background: '#181818',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 10,
        padding: '18px 22px',
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.5px',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          marginBottom: 12,
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Recent Activity
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 ? (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            No activity yet.
          </div>
        ) : (
          items.map((it) => {
            const ic = iconMap[it.icon];
            return (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                <span style={{ color: ic.color }}>{ic.char}</span>
                {it.message}{' '}
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {it.timestamp}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ============================================
// LOADING / ERROR STATES
// ============================================
function DashboardLoading() {
  return (
    <div
      style={{
        background: '#0A0A0A',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            height: 40,
            marginBottom: 20,
            alignItems: 'flex-end',
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                background: '#F5CE00',
                borderRadius: 2,
                animation: 'iei-wave 1.2s ease-in-out infinite',
                animationDelay: `${i * 80}ms`,
                height: '30%',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          Loading your dashboard...
        </div>
      </div>
      <style>{`
        @keyframes iei-wave {
          0%, 100% { height: 30%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
}

function DashboardEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
        Dashboard
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '10px 0 8px', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>
        No brand yet
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 24 }}>
        You haven&apos;t created a brand foundation yet. Once you do, this dashboard
        — and your Brand Kit — fill in with your own colors, typography, and assets.
      </p>
      <button
        onClick={onStart}
        style={{
          background: '#F5CE00',
          color: '#0A0A0A',
          border: 'none',
          borderRadius: 8,
          padding: '12px 22px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Create your brand
      </button>
    </div>
  );
}

function DashboardError({
  err,
  onRetry,
}: {
  err: string;
  onRetry: () => void;
}) {
  return (
    <div
      style={{
        background: '#0A0A0A',
        color: '#fff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div
          style={{
            fontSize: 13,
            color: '#F87171',
            marginBottom: 14,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
          }}
        >
          Couldn't load your dashboard
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 20,
            lineHeight: 1.6,
          }}
        >
          {err || 'Something went wrong.'}
        </div>
        <button onClick={onRetry} style={primaryBtnStyle}>
          Try again
        </button>
      </div>
    </div>
  );
}

// ============================================
// HELPERS
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

function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('iei-brand-build');
    if (!stored) return 'demo'; // fallback for preview
    const parsed = JSON.parse(stored);
    return parsed?.state?.sessionId || 'demo';
  } catch {
    return 'demo';
  }
}

// ============================================
// STYLES
// ============================================
const primaryBtnStyle: React.CSSProperties = {
  background: '#F5CE00',
  color: '#0A0A0A',
  border: 'none',
  padding: '10px 18px',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: 12,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
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
