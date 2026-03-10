import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  meta?: string;
  borderColor?: string;
  criticalPulse?: boolean;
}

export function Card({ title, subtitle, icon, children, meta, borderColor, criticalPulse }: CardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#111820',
        borderTop: borderColor ? `2px solid ${borderColor}` : undefined,
        animation: criticalPulse ? 'critical-pulse 2s ease-in-out infinite' : 'none',
        borderRadius: '0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          background: '#151c26',
          flexShrink: 0,
          minHeight: '36px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          {icon && <span style={{ color: '#64748b', display: 'flex', flexShrink: 0 }}>{icon}</span>}
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8b9ab5',
            }}
          >
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: '9px', color: '#4e5f74', marginLeft: '4px' }}>
              {subtitle}
            </span>
          )}
        </div>
        {meta && (
          <span style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em', flexShrink: 0 }}>
            {meta}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
        {children}
      </div>
    </div>
  );
}
