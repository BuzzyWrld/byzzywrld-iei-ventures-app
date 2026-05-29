'use client';

import { useEffect, useRef, useState } from 'react';

type Section = 'colors' | 'typography' | 'assets';
type ApprovalState = 'pending' | 'needs_work' | 'approved';

interface BrandReviewButtonProps {
  section: Section;
  /** Placeholder for the AI prompt input inside the Edit bubble. */
  placeholder: string;
  /** Heading shown at the top of the Edit bubble. */
  heading?: string;
  /** Fires when the user submits a regeneration prompt. */
  onSubmitPrompt?: (prompt: string) => void;
  /** Section-specific editor (hex rows, font fields) rendered inside the bubble. */
  children?: React.ReactNode;
}

const STORAGE_PREFIX = 'iei_brand_review_';
const CONFIRM_MS = 1500;

function readApproval(section: Section): ApprovalState {
  if (typeof window === 'undefined') return 'pending';
  const stored = window.localStorage.getItem(STORAGE_PREFIX + section);
  if (stored === 'approved' || stored === 'needs_work') return stored;
  return 'pending';
}

export default function BrandReviewButton({
  section,
  placeholder,
  heading = 'Edit Your Brand',
  onSubmitPrompt,
  children,
}: BrandReviewButtonProps) {
  const [approval, setApproval] = useState<ApprovalState>('pending');
  const [confirming, setConfirming] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  // Hydrate persisted approval after mount (avoids SSR/client mismatch).
  useEffect(() => {
    setApproval(readApproval(section));
  }, [section]);

  // Close the bubble on outside click or Escape.
  useEffect(() => {
    if (!bubbleOpen) return;
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setBubbleOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setBubbleOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [bubbleOpen]);

  function handleLooksGood() {
    setConfirming(true);
    window.setTimeout(() => {
      setConfirming(false);
      setApproval('approved');
      window.localStorage.setItem(STORAGE_PREFIX + section, 'approved');
    }, CONFIRM_MS);
  }

  function handleNeedsWork() {
    setApproval('needs_work');
    window.localStorage.setItem(STORAGE_PREFIX + section, 'needs_work');
    setBubbleOpen(true);
  }

  function handleSubmitPrompt() {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    onSubmitPrompt?.(trimmed);
    setPrompt('');
    setBubbleOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <style>{keyframes}</style>

      {approval === 'approved' ? (
        <button
          onClick={() => setBubbleOpen((v) => !v)}
          style={editBtnStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ✏ Edit
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleLooksGood}
            disabled={confirming}
            style={confirming ? confirmBtnStyle : looksGoodBtnStyle}
          >
            {confirming ? '✓ Approved' : '✓ Looks Good'}
          </button>
          <button
            onClick={handleNeedsWork}
            style={approval === 'needs_work' ? needsWorkActiveBtnStyle : needsWorkBtnStyle}
          >
            ✎ Needs Work
          </button>
        </div>
      )}

      {bubbleOpen && (
        <div style={bubbleStyle}>
          <button onClick={() => setBubbleOpen(false)} style={closeBtnStyle} aria-label="Close">
            ✕
          </button>
          <div style={bubbleHeadingStyle}>{heading}</div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitPrompt();
            }}
            placeholder={placeholder}
            rows={3}
            style={promptInputStyle}
          />
          <button onClick={handleSubmitPrompt} style={submitBtnStyle}>
            Submit
          </button>

          {children && <div style={editorPanelStyle}>{children}</div>}
        </div>
      )}
    </div>
  );
}

const keyframes = `
@keyframes ieiBubbleIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ieiPulse { 0% { transform: scale(1); } 50% { transform: scale(1.06); } 100% { transform: scale(1); } }
`;

const baseBtn: React.CSSProperties = {
  padding: '7px 16px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
  whiteSpace: 'nowrap',
  transition: 'background 150ms ease',
};

const looksGoodBtnStyle: React.CSSProperties = {
  ...baseBtn,
  border: '1px solid #22C55E',
  color: '#22C55E',
  background: 'rgba(34,197,94,0.08)',
};

const confirmBtnStyle: React.CSSProperties = {
  ...baseBtn,
  border: '1px solid #22C55E',
  color: '#0A0A0A',
  background: '#22C55E',
  cursor: 'default',
  animation: 'ieiPulse 600ms ease',
};

const needsWorkBtnStyle: React.CSSProperties = {
  ...baseBtn,
  border: '1px solid #F5CE00',
  color: '#F5CE00',
  background: 'rgba(245,206,0,0.08)',
};

const needsWorkActiveBtnStyle: React.CSSProperties = {
  ...baseBtn,
  border: '1px solid #F5CE00',
  color: '#0A0A0A',
  background: '#F5CE00',
};

const editBtnStyle: React.CSSProperties = {
  ...baseBtn,
  border: '1px solid #6B7280',
  color: '#9CA3AF',
  background: 'transparent',
};

const bubbleStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  zIndex: 50,
  width: 340,
  background: '#1C1C1E',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  padding: 20,
  animation: 'ieiBubbleIn 180ms ease',
};

const bubbleHeadingStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#fff',
  marginBottom: 12,
  fontFamily: "'Space Grotesk', sans-serif",
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  width: 22,
  height: 22,
  border: 'none',
  background: 'transparent',
  color: 'rgba(255,255,255,0.5)',
  fontSize: 13,
  cursor: 'pointer',
  lineHeight: 1,
};

const promptInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0A0A0A',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 12,
  fontFamily: "'DM Sans', sans-serif",
  padding: '10px 12px',
  resize: 'vertical',
  boxSizing: 'border-box',
  marginBottom: 10,
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  background: '#F5CE00',
  color: '#0A0A0A',
  border: 'none',
  borderRadius: 8,
  padding: '9px 0',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'DM Sans', sans-serif",
};

const editorPanelStyle: React.CSSProperties = {
  marginTop: 16,
  paddingTop: 16,
  borderTop: '1px solid rgba(255,255,255,0.08)',
};
