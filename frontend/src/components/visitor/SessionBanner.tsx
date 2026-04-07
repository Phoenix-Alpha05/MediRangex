import { useState, useEffect, useRef } from 'react';

interface Props {
  expiresAt: number;
  onExpired: () => void;
}

function formatTime(ms: number): string {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SessionBanner({ expiresAt, onExpired }: Props) {
  const [remaining, setRemaining] = useState(() => expiresAt - Date.now());
  const [visible, setVisible] = useState(false);
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const tick = () => {
      const left = expiresAt - Date.now();
      setRemaining(left);
      if (left <= 0) {
        onExpiredRef.current();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const totalMs = 15 * 60 * 1000;
  const progress = Math.max(0, Math.min(1, remaining / totalMs));
  const isWarning = remaining < 3 * 60 * 1000;
  const isCritical = remaining < 60 * 1000;

  const accentColor = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';
  const bgColor = isCritical
    ? 'rgba(239,68,68,0.08)'
    : isWarning
    ? 'rgba(245,158,11,0.08)'
    : 'rgba(56,189,248,0.06)';
  const borderColor = isCritical
    ? 'rgba(239,68,68,0.2)'
    : isWarning
    ? 'rgba(245,158,11,0.2)'
    : 'rgba(56,189,248,0.15)';

  return (
    <>
      <style>{`
        @keyframes mrx-banner-in {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mrx-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .mrx-session-banner {
          animation: mrx-banner-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
        }
      `}</style>
      <div
        className="mrx-session-banner"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9990,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          background: bgColor,
          borderBottom: `1px solid ${borderColor}`,
          backdropFilter: 'blur(8px)',
          padding: '6px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: accentColor,
            animation: isCritical ? 'mrx-pulse-dot 0.8s ease infinite' : 'mrx-pulse-dot 2s ease infinite',
            flexShrink: 0,
          }} />

          <span style={{
            fontSize: '0.7rem', fontWeight: 600, color: accentColor,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Demo Session
          </span>

          <span style={{ fontSize: '0.7rem', color: '#475569', letterSpacing: '0.04em' }}>
            {isCritical ? 'Expiring soon —' : 'Time remaining:'}
          </span>

          <span style={{
            fontSize: '0.78rem', fontWeight: 800, color: accentColor,
            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.06em',
            minWidth: '2.8rem', textAlign: 'center',
          }}>
            {formatTime(remaining)}
          </span>

          <div style={{
            width: 80, height: 3, background: 'rgba(255,255,255,0.06)',
            borderRadius: 999, overflow: 'hidden', flexShrink: 0,
          }}>
            <div style={{
              height: '100%',
              width: `${progress * 100}%`,
              background: accentColor,
              borderRadius: 999,
              transition: 'width 1s linear, background 0.5s ease',
            }} />
          </div>
        </div>
      </div>
    </>
  );
}
