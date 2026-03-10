import { TOC_SECTIONS } from './specData';

interface SpecSidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
}

export default function SpecSidebar({ activeSection, onNavigate }: SpecSidebarProps) {
  return (
    <aside style={{
      position: 'sticky',
      top: 80,
      width: 240,
      flexShrink: 0,
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
      paddingRight: '0.5rem',
    }}>
      <div style={{
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
        paddingLeft: '0.75rem',
      }}>
        Table of Contents
      </div>
      <nav>
        {TOC_SECTIONS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: isActive ? 'rgba(56,189,248,0.08)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid #38bdf8' : '2px solid transparent',
                padding: '0.45rem 0.75rem',
                cursor: 'pointer',
                fontSize: '0.72rem',
                color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1.4,
                borderRadius: '0 4px 4px 0',
                transition: 'all 0.15s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
