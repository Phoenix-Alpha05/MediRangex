import { useEffect, useRef, useState } from 'react';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Props {
  targetSelector: string | null;
  color: string;
}

export function HighlightOverlay({ targetSelector, color }: Props) {
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!targetSelector) {
      setRect(null);
      return;
    }

    const update = () => {
      const el = document.querySelector(targetSelector);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetSelector]);

  if (!rect) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: rect.top - 6,
        left: rect.left - 6,
        width: rect.width + 12,
        height: rect.height + 12,
        borderRadius: '6px',
        border: `2px solid ${color}`,
        boxShadow: `0 0 0 1px ${color}30, 0 0 20px ${color}25, inset 0 0 20px ${color}08`,
        pointerEvents: 'none',
        zIndex: 9000,
        transition: 'top 0.4s cubic-bezier(0.4,0,0.2,1), left 0.4s cubic-bezier(0.4,0,0.2,1), width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1), border-color 0.4s ease, box-shadow 0.4s ease',
        animation: 'guide-highlight-pulse 2.5s ease-in-out infinite',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-1px',
          left: '16px',
          background: color,
          color: '#000',
          fontSize: '9px',
          fontWeight: 800,
          letterSpacing: '0.1em',
          padding: '2px 8px',
          borderRadius: '0 0 4px 4px',
          textTransform: 'uppercase',
          opacity: 0.9,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        AI GUIDE
      </div>
    </div>
  );
}
