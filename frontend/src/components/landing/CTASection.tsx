interface Props {
  onRequestAccess?: () => void;
}

export default function CTASection({ onRequestAccess }: Props) {

  return (
    <section style={{ padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>
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

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', position: 'relative' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.2)',
          borderRadius: '9999px',
          marginBottom: '2rem',
        }}>
          <div className="status-dot" />
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
            Now accepting pilot partners
          </span>
        </div>

        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          margin: '0 0 1.5rem',
          color: '#f0f4ff',
        }}>
          Ready to Transform<br />
          <span className="text-gradient-cyan">Clinical Decision Making?</span>
        </h2>

        <p style={{
          fontSize: '1.05rem',
          color: '#94a3b8',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
          maxWidth: 540,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Join the growing network of hospitals deploying MediRangeX to reduce
          sepsis mortality, prevent adverse drug events, and eliminate operational
          blind spots — all from a single platform.
        </p>

        <div style={{ marginBottom: '2.5rem' }}>
          <button
            className="btn-primary"
            onClick={onRequestAccess}
            style={{ padding: '0.875rem 2.5rem', fontSize: '0.95rem' }}
          >
            Request Access
            <span style={{ marginLeft: '0.5rem' }}>→</span>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { icon: '🔒', text: 'HIPAA-aligned architecture' },
            { icon: '⚡', text: 'Deploy in under 1 week' },
            { icon: '🤝', text: 'Dedicated clinical support' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#475569' }}>
              <span style={{ fontSize: '1rem' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
