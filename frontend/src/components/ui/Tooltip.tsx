import { useState, useRef, useEffect, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show || !triggerRef.current || !tipRef.current) return;
    const tr = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const left = tr.left + tr.width / 2 - tip.width / 2;
    const top = position === 'top' ? tr.top - tip.height - 6 : tr.bottom + 6;
    setCoords({ left: Math.max(4, left), top });
  }, [show, position]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ display: 'inline-flex', cursor: 'default' }}
      >
        {children}
      </span>
      {show && (
        <div
          ref={tipRef}
          style={{
            position: 'fixed',
            left: coords.left,
            top: coords.top,
            background: '#1a2332',
            color: '#c8d3e2',
            fontSize: '10px',
            fontWeight: 500,
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.08)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {content}
        </div>
      )}
    </>
  );
}
