export default function Footer() {
  return (
    <footer style={{
      padding: '3rem 0 2rem',
      borderTop: '1px solid rgba(56,189,248,0.06)',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(56,189,248,0.4)',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4ff' }}>
                Medi<span style={{ color: '#38bdf8' }}>RangeX</span>
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7, maxWidth: 280, margin: '0 0 1rem' }}>
              Clinical intelligence platform integrating sepsis prediction, drug safety,
              operations forecasting, and ML observability.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="status-dot" />
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 500 }}>
                All systems operational
              </span>
            </div>
          </div>

          {[
            {
              title: 'Platform',
              links: ['Sepsis Engine', 'Drug Safety', 'Ops Forecasting', 'ML Observability', 'Command Center'],
            },
            {
              title: 'Integration',
              links: ['REST API', 'OpenAPI Docs', 'RBAC Guide', 'FHIR Roadmap', 'SDK'],
            },
            {
              title: 'Company',
              links: ['About', 'Research', 'Compliance', 'Privacy Policy', 'Contact'],
            },
          ].map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {col.links.map(link => (
                  <a key={link} href="#" style={{
                    fontSize: '0.82rem',
                    color: '#475569',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{ fontSize: '0.75rem', color: '#2d3748' }}>
            © 2026 MediRangeX. Clinical intelligence for modern healthcare.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['HIPAA', 'SOC 2', 'HL7 FHIR'].map(badge => (
              <span key={badge} style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                color: '#2d3748',
                padding: '0.15rem 0.5rem',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '0.25rem',
                letterSpacing: '0.05em',
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
