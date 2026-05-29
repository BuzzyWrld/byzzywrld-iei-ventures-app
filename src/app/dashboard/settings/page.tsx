'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

interface AccountStatus {
  email: string;
  name: string;
  googleLinked: boolean;
  hasPassword: boolean;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={subtextStyle}>Loading…</div>}>
      <SettingsInner />
    </Suspense>
  );
}

function SettingsInner() {
  const params = useSearchParams();
  const [account, setAccount] = useState<AccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const justLinked = params.get('linked') === '1';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/account', { credentials: 'include' });
        if (!res.ok) throw new Error(`Could not load account (${res.status})`);
        setAccount((await res.json()) as AccountStatus);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to load account');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={eyebrowStyle}>Settings</div>
        <h1 style={headingStyle}>Account &amp; Connections</h1>
        <p style={subtextStyle}>
          Manage how you sign in. Linking Google lets you log in with one click —
          it never merges separate accounts automatically.
        </p>
      </div>

      {justLinked && (
        <div style={{ ...bannerStyle, borderColor: '#22C55E', color: '#22C55E', background: 'rgba(34,197,94,0.08)' }}>
          ✓ Google connected to your account.
        </div>
      )}

      {loading ? (
        <div style={subtextStyle}>Loading…</div>
      ) : err ? (
        <div style={{ ...bannerStyle, borderColor: '#EF4444', color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>
          {err}
        </div>
      ) : account ? (
        <div style={cardStyle}>
          <div style={rowStyle}>
            <div>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{account.email}</div>
            </div>
          </div>

          <div style={{ ...rowStyle, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={labelStyle}>Sign-in methods</div>
              <div style={valueStyle}>
                {account.hasPassword ? 'Email & password' : 'OAuth only'}
                {account.googleLinked ? ' · Google' : ''}
              </div>
            </div>
          </div>

          <div style={{ ...rowStyle, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <div style={labelStyle}>Google</div>
              <div style={valueStyle}>
                {account.googleLinked ? 'Connected' : 'Not connected'}
              </div>
            </div>
            {!account.googleLinked && (
              <button
                onClick={() =>
                  signIn('google', { callbackUrl: '/dashboard/settings?linked=1' })
                }
                style={connectBtnStyle}
              >
                Connect Google
              </button>
            )}
          </div>
        </div>
      ) : null}
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
const subtextStyle: React.CSSProperties = {
  fontSize: 13,
  color: 'rgba(255,255,255,0.5)',
  lineHeight: 1.5,
};
const cardStyle: React.CSSProperties = {
  background: '#141414',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
};
const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  padding: '16px 20px',
};
const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.35)',
  marginBottom: 4,
};
const valueStyle: React.CSSProperties = { fontSize: 14, color: '#fff' };
const connectBtnStyle: React.CSSProperties = {
  background: '#F5CE00',
  color: '#0A0A0A',
  border: 'none',
  borderRadius: 8,
  padding: '9px 16px',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  whiteSpace: 'nowrap',
};
const bannerStyle: React.CSSProperties = {
  border: '1px solid',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};
