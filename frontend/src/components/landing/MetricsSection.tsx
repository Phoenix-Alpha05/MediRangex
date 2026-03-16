import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

function useInView(ref: React.RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

function AnimatedCounter({ target, decimal, suffix }: { target: number; decimal?: boolean; suffix?: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);

  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      const duration = 1800;
      const steps = 60;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(eased * target);
        if (step >= steps) clearInterval(timer);
      }, duration / steps);
      return () => clearInterval(timer);
    }
  }, [inView, started, target]);

  return (
    <span ref={ref}>
      {decimal ? value.toFixed(1) : Math.floor(value).toLocaleString()}
      {suffix}
    </span>
  );
}

const METRICS = [
  { value: 97.3, suffix: '%', decimal: true, label: 'Sepsis Alert Accuracy', sub: 'Validated on clinical datasets', color: '#10b981' },
  { value: 847, suffix: '+', label: 'Drug Interactions Mapped', sub: 'With context modifier logic', color: '#38bdf8' },
  { value: 43, suffix: 'ms', label: 'Median Response Time', sub: 'Across all API endpoints', color: '#818cf8' },
  { value: 24, suffix: '/7', label: 'Real-Time Monitoring', sub: 'Zero downtime architecture', color: '#f59e0b' },
  { value: 5, suffix: ' domains', label: 'Clinical Intelligence Streams', sub: 'Unified in one dashboard', color: '#14b8a6' },
  { value: 99.9, suffix: '%', decimal: true, label: 'Platform Uptime SLA', sub: 'Enterprise-grade reliability', color: '#f43f5e' },
];

const ROLES = [
  {
    role: 'Clinician',
    color: '#f43f5e',
    dimColor: 'rgba(244,63,94,0.08)',
    borderColor: 'rgba(244,63,94,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    capabilities: ['Sepsis risk prediction', 'Clinical pathway reasoning', 'Patient vitals assessment', 'Evidence-based recommendations'],
  },
  {
    role: 'Pharmacist',
    color: '#f59e0b',
    dimColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    capabilities: ['Drug interaction checks', 'Context-aware severity', 'RxNorm code lookups', 'Renal/hepatic modifiers'],
  },
  {
    role: 'Data Scientist',
    color: '#38bdf8',
    dimColor: 'rgba(56,189,248,0.08)',
    borderColor: 'rgba(56,189,248,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    capabilities: ['ICU capacity forecasting', 'ML model monitoring', 'Drift detection alerts', 'Knowledge bank access'],
  },
  {
    role: 'Administrator',
    color: '#818cf8',
    dimColor: 'rgba(129,140,248,0.08)',
    borderColor: 'rgba(129,140,248,0.2)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round"/>
      </svg>
    ),
    capabilities: ['Full platform access', 'ML prediction logs', 'Command center', 'System health monitoring'],
  },
];

export default function MetricsSection() {
  const [activeRole, setActiveRole] = useState(0);
  const isMobile = useIsMobile();

  return (
    <section id="metrics" style={{ padding: isMobile ? '4rem 0' : '7rem 0', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(56,189,248,0.02)',
        borderTop: '1px solid rgba(56,189,248,0.05)',
        borderBottom: '1px solid rgba(56,189,248,0.05)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="tag tag-amber" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            Performance
          </span>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '1rem 0 1rem',
            color: '#f0f4ff',
          }}>
            Built for Clinical-Grade Performance
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: 540, margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            Every component is engineered for the uncompromising demands of healthcare
            environments — speed, accuracy, and reliability are non-negotiable.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '0.875rem',
          marginBottom: isMobile ? '3rem' : '5rem',
        }}>
          {METRICS.map((m) => (
            <div key={m.label}
              className="card-hover-lift"
              style={{
                background: 'rgba(8,12,20,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.875rem',
                padding: '1.5rem',
              }}
            >
              <div style={{
                fontSize: 'clamp(2rem, 3vw, 2.5rem)',
                fontWeight: 900,
                fontFamily: "'JetBrains Mono', monospace",
                color: m.color,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                marginBottom: '0.5rem',
              }}>
                <AnimatedCounter target={m.value} decimal={m.decimal} suffix={m.suffix} />
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f0f4ff', marginBottom: '0.3rem' }}>
                {m.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                {m.sub}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em', margin: 0 }}>
              Role-Based Access Architecture
            </h3>
            <p style={{ color: '#94a3b8', marginTop: '0.75rem', fontSize: '0.9rem' }}>
              Every endpoint is protected by granular RBAC — ensuring clinicians see clinical data,
              not admin logs.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.875rem' }}>
            {ROLES.map((r, i) => (
              <div
                key={r.role}
                onClick={() => setActiveRole(i)}
                style={{
                  background: activeRole === i ? r.dimColor : 'rgba(8,12,20,0.6)',
                  border: `1px solid ${activeRole === i ? r.borderColor : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '0.875rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  if (activeRole !== i) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={e => {
                  if (activeRole !== i) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '0.5rem',
                  background: r.dimColor,
                  border: `1px solid ${r.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: r.color,
                  marginBottom: '0.875rem',
                }}>
                  {r.icon}
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.875rem' }}>
                  {r.role}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {r.capabilities.map((c, j) => (
                    <div key={j} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', alignItems: 'flex-start' }}>
                      <div style={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: activeRole === i ? r.color : '#334155',
                        flexShrink: 0,
                        marginTop: '0.35rem',
                        transition: 'background 0.2s',
                      }} />
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
