interface Props {
  lastUpdated: Date | null;
  latencyMs: number | null;
}

export function FooterStrip({ lastUpdated, latencyMs }: Props) {
  return (
    <div
      style={{
        height: '24px',
        background: '#0a0e17',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {lastUpdated && (
        <span style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>
          LAST UPDATED {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      )}

      <span style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em' }}>
        AUTO-REFRESH 30s
      </span>

      {latencyMs !== null && (
        <span style={{
          fontSize: '9px',
          letterSpacing: '0.06em',
          fontVariantNumeric: 'tabular-nums',
          color: latencyMs > 2000 ? '#f97316' : latencyMs > 500 ? '#f59e0b' : '#4e5f74',
        }}>
          LATENCY {latencyMs}ms
        </span>
      )}

      <span style={{ flex: 1 }} />

      <span style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em' }}>
        Press <kbd style={{
          background: '#151c26',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '2px',
          padding: '0 3px',
          fontSize: '9px',
          color: '#8b9ab5',
        }}>R</kbd> to refresh
      </span>

      <span style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em' }}>
        MediRangeX v0.1
      </span>
    </div>
  );
}
