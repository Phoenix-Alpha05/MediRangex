import { useViewMode } from '../../context/ViewModeContext';

function PhoneIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  );
}

export function ViewToggle() {
  const { viewMode, setViewMode } = useViewMode();
  const isMobile = viewMode === 'mobile';

  return (
    <div
      className="view-toggle-widget"
      style={{
        position: 'fixed',
        top: '72px',
        right: '8rem',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(8,12,22,0.95)',
        border: `1px solid ${isMobile ? 'rgba(245,158,11,0.5)' : 'rgba(245,158,11,0.2)'}`,
        borderRadius: '0.5rem',
        overflow: 'hidden',
        boxShadow: isMobile
          ? '0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.12)'
          : '0 4px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(16px)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <button
        onClick={() => setViewMode('desktop')}
        title="Switch to Desktop view"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.42rem 0.7rem',
          border: 'none',
          borderRight: '1px solid rgba(245,158,11,0.12)',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'all 0.18s ease',
          background: !isMobile ? 'rgba(245,158,11,0.14)' : 'transparent',
          color: !isMobile ? '#f59e0b' : '#3d4f63',
        }}
      >
        <MonitorIcon />
        <span>Desktop</span>
      </button>

      <button
        onClick={() => setViewMode('mobile')}
        title="Switch to Mobile view"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          padding: '0.42rem 0.7rem',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.04em',
          transition: 'all 0.18s ease',
          background: isMobile ? 'rgba(245,158,11,0.14)' : 'transparent',
          color: isMobile ? '#f59e0b' : '#3d4f63',
        }}
      >
        <PhoneIcon />
        <span>Mobile</span>
      </button>
    </div>
  );
}
