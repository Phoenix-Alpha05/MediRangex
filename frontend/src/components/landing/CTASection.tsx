import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  onRequestAccess?: () => void;
}

export default function CTASection({ onRequestAccess }: Props) {
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: isMobile ? '4rem 0' : '7rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(ellipse, rgba(56,189,248,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.25rem', textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '9999px',
          marginBottom: '1.5rem',
        }}>
          <div className="status-dot" />
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
            Now accepting pilot partners
          </span>
        </div>

        <h2 style={{
          fontSize: isMobile ? '1.6rem' : 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          margin: isMobile ? '0 0 1rem' : '0 0 1.5rem',
          color: '#f0f4ff',
        }}>
          Ready to Transform<br />
          <span className="text-gradient-cyan">Clinical Decision Making?</span>
        </h2>

        <p style={{
          fontSize: isMobile ? '0.875rem' : '1.05rem',
          color: '#94a3b8',
          lineHeight: 1.65,
          marginBottom: '2rem',
          maxWidth: 540,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Join the growing network of hospitals deploying MediRangeX to reduce
          sepsis mortality, prevent adverse drug events, and eliminate operational
          blind spots — all from a single platform.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <button
            className="btn-primary"
            onClick={onRequestAccess}
            style={{ padding: isMobile ? '0.7rem 1.75rem' : '0.875rem 2.5rem', fontSize: isMobile ? '0.875rem' : '0.95rem' }}
          >
            Request Access
            <span style={{ marginLeft: '0.5rem' }}>→</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? '1rem' : '2.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '🔒', text: 'HIPAA-aligned architecture' },
            { icon: '⚡', text: 'Deploy in under 1 week' },
            { icon: '🤝', text: 'Dedicated clinical support' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#475569' }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
