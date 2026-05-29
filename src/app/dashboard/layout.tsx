'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { icon: '▦', label: 'Overview', href: '/dashboard' },
  { icon: '◐', label: 'Brand Kit', href: '/dashboard/brand-kit' },
  { icon: '◯', label: 'Website', href: '/dashboard/website' },
  { icon: '⊙', label: 'Lead Gen', href: '/dashboard/lead-gen' },
  { icon: '◬', label: 'Content Calendar', href: '/dashboard/content-calendar' },
  { icon: '◇', label: 'Entity Setup', href: '/dashboard/entity-setup' },
  { icon: '▥', label: 'Workspace', href: '/dashboard/workspace' },
  { icon: '⚙', label: 'Settings', href: '/dashboard/settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <style>{`
        .dash-grid {
          background: #0A0A0A;
          color: #fff;
          min-height: 100vh;
          font-family: 'DM Sans', system-ui, sans-serif;
          display: grid;
          grid-template-columns: 240px 1fr;
        }
        .dash-sidebar {
          background: #0F0F0F;
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 24px 18px;
          position: sticky;
          top: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .dash-main {
          padding: 28px 36px;
          min-height: 100vh;
        }
        .mobile-header {
          display: none;
        }
        .mobile-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .dash-grid {
            grid-template-columns: 1fr;
          }
          .dash-sidebar {
            display: none;
          }
          .dash-sidebar.mobile-open {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 100;
            height: 100vh;
            width: 280px;
            box-shadow: 4px 0 20px rgba(0,0,0,0.5);
          }
          .mobile-overlay {
            display: none;
          }
          .mobile-overlay.active {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            z-index: 99;
          }
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 16px;
            background: #0F0F0F;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: sticky;
            top: 0;
            z-index: 50;
          }
          .dash-main {
            padding: 16px;
          }
          /* Force all grids in dashboard pages to single column on mobile */
          .dash-main div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
          /* KPI row: 2 columns on mobile instead of 4 */
          .dash-main div[style*="1fr 1fr 1fr 1fr"] {
            grid-template-columns: 1fr 1fr !important;
          }
          /* Calendar grid: 2 columns on mobile instead of 7 */
          .dash-main div[style*="repeat(7"] {
            grid-template-columns: 1fr 1fr !important;
          }
          /* Headings smaller on mobile */
          .dash-main h1 {
            font-size: 22px !important;
          }
          /* Buttons stack on mobile */
          .dash-main div[style*="display: flex"][style*="gap: 8"] {
            flex-wrap: wrap;
          }
          /* Table grids scroll horizontally */
          .dash-main div[style*="grid-template-columns: 2fr"],
          .dash-main div[style*="grid-template-columns: 0.5fr"] {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
        }
      `}</style>

      {/* Mobile header */}
      <div className="mobile-header">
        <button
          onClick={() => setMobileOpen(true)}
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}
        >
          ☰
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 18, height: 18, border: '1.5px solid #F5CE00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 700, color: '#F5CE00', fontFamily: "'Space Grotesk', sans-serif" }}>IEI</div>
          <span style={{ fontWeight: 600, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>Ventures</span>
        </div>
        <div style={{ width: 28 }} />
      </div>

      {/* Mobile overlay */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="dash-grid">
        {/* Sidebar */}
        <aside className={`dash-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
          {/* Close button (mobile) */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{ display: 'none', position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 18, cursor: 'pointer' }}
            className="mobile-close"
          >
            ✕
          </button>
          <style>{`.mobile-open .mobile-close { display: block !important; }`}</style>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, padding: '0 6px' }}>
            <div style={{ width: 22, height: 22, border: '1.5px solid #F5CE00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#F5CE00', fontFamily: "'Space Grotesk', sans-serif" }}>
              IEI
            </div>
            <span style={{ fontWeight: 600, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif" }}>Ventures</span>
          </div>

          {/* Current Brand */}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10, padding: '0 6px' }}>
            Current Brand
          </div>
          <div style={{ background: 'rgba(245,206,0,0.08)', border: '1px solid rgba(245,206,0,0.25)', borderRadius: 6, padding: '12px 14px', marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, background: '#F5CE00', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0A0A0A' }}>A</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Apex Studio</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Creative Agency</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 10, padding: '0 6px' }}>
            Workspace
          </div>
          <nav>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setMobileOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 5,
                    border: 'none',
                    background: active ? 'rgba(245,206,0,0.1)' : 'transparent',
                    color: active ? '#F5CE00' : 'rgba(255,255,255,0.6)',
                    fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    textAlign: 'left',
                    marginBottom: 2,
                  }}
                >
                  <span style={{ fontSize: 14, width: 18, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* New Brand */}
          <button
            onClick={() => { router.push('/new'); setMobileOpen(false); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: 'auto',
              padding: '10px',
              borderRadius: 6,
              border: '1px solid rgba(245,206,0,0.3)',
              background: 'transparent',
              color: '#F5CE00',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            + New Brand
          </button>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          {children}
        </main>
      </div>
    </>
  );
}
