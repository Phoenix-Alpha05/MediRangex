import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPEC_SECTIONS } from '../spec/specData';
import { useIsMobile } from '../../hooks/useIsMobile';

const TERMINAL_LINES = [
  { text: '> Initializing MediRangeX Clinical Intelligence...', color: '#94a3b8', delay: 0 },
  { text: '> Loading sepsis prediction engine v2.4.1', color: '#38bdf8', delay: 600 },
  { text: '> Drug safety knowledge base: 847 interactions mapped', color: '#10b981', delay: 1200 },
  { text: '> Operations ML models: ONLINE', color: '#10b981', delay: 1800 },
  { text: '> Patient 0042 — CRITICAL alert: Sepsis Risk Score 8/12', color: '#f43f5e', delay: 2400 },
  { text: '> Recommending: Blood cultures × 2, Broad-spectrum ABx, Lactate', color: '#f59e0b', delay: 3000 },
  { text: '> ICU Capacity Forecast 6h: 87% occupancy — SURGE threshold', color: '#f97316', delay: 3600 },
  { text: '> All systems nominal. Command Center ready.', color: '#10b981', delay: 4200 },
];

const LIVE_STATS = [
  { label: 'Patients Monitored', value: 2847, suffix: '', color: '#38bdf8' },
  { label: 'Predictions / hr', value: 1240, suffix: '+', color: '#10b981' },
  { label: 'Alert Accuracy', value: 97.3, suffix: '%', color: '#f59e0b', decimal: true },
  { label: 'Response Time', value: 43, suffix: 'ms', color: '#818cf8' },
];

const OVERVIEW = SPEC_SECTIONS[0];

function AnimatedNumber({ target, decimal }: { target: number; decimal?: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCurrent(Math.min(increment * step, target));
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <>{decimal ? current.toFixed(1) : Math.floor(current).toLocaleString()}</>;
}

function TerminalLine({ text, color, index }: { text: string; color: string; index: number }) {
  const [visible, setVisible] = useState(false);
  const delay = TERMINAL_LINES[index]?.delay ?? 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!visible) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '0.5rem',
      fontSize: '0.72rem',
      lineHeight: 1.6,
      fontFamily: "'JetBrains Mono', monospace",
      color,
      animation: 'fade-up 0.3s ease forwards',
    }}>
      <span style={{ opacity: 0.4, flexShrink: 0 }}>›</span>
      <span>{text.replace('> ', '')}</span>
    </div>
  );
}

function RuntimeBanner() {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setExpanded(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      height: '32px',
      borderTop: '1px solid rgba(56,189,248,0.15)',
      borderBottom: '1px solid rgba(56,189,248,0.15)',
      background: 'rgba(56,189,248,0.03)',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '0.75rem',
        gap: '0.5rem',
        transform: expanded ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left center',
        transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        background: 'linear-gradient(90deg, rgba(56,189,248,0.05) 0%, transparent 100%)',
      }}>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#38bdf8',
          boxShadow: '0 0 8px #38bdf8',
          animation: 'pulse-dot 2s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          color: '#38bdf8',
          letterSpacing: '0.06em',
          fontWeight: 500,
          whiteSpace: 'nowrap',
          opacity: expanded ? 1 : 0,
          transition: 'opacity 0.4s ease 0.8s',
        }}>
          medirx-intelligence v2.4.1 — clinical runtime
        </span>
        <div style={{
          flex: 1,
          height: '1px',
          background: 'linear-gradient(90deg, rgba(56,189,248,0.3), transparent)',
          marginLeft: '0.5rem',
          opacity: expanded ? 1 : 0,
          transition: 'opacity 0.4s ease 1s',
        }} />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingRight: '0.75rem',
          opacity: expanded ? 1 : 0,
          transition: 'opacity 0.4s ease 1.1s',
        }}>
          {['SEPSIS', 'DRUG SAFETY', 'OPS ML'].map(lbl => (
            <span key={lbl} style={{
              fontSize: '0.55rem',
              fontFamily: "'JetBrains Mono', monospace",
              color: '#10b981',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              {lbl}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutPanel() {
  const isMobile = useIsMobile();
  const mission = OVERVIEW.subsections.find(s => s.title === 'Mission');
  const vision = OVERVIEW.subsections.find(s => s.title === 'Vision');
  const problem = OVERVIEW.subsections.find(s => s.title === 'Core Problem Statement');
  const users = OVERVIEW.subsections.find(s => s.title === 'Target Users');

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? '2rem' : '4rem',
      alignItems: 'start',
      animation: 'fade-up 0.4s ease forwards',
    }}>
      <div>
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="tag tag-cyan">
            <span className="status-dot" style={{ width: 5, height: 5 }} />
            Platform Overview
          </span>
        </div>

        <h2 style={{
          fontSize: isMobile ? '1.5rem' : 'clamp(1.8rem, 3vw, 2.75rem)',
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          margin: '0 0 1.25rem',
          color: '#f0f4ff',
        }}>
          Built for Health Systems<br />
          <span className="text-gradient-cyan">Under Pressure</span>
        </h2>

        <p style={{
          fontSize: '0.95rem',
          lineHeight: 1.75,
          color: '#94a3b8',
          margin: '0 0 2rem',
        }}>
          {OVERVIEW.intro}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {mission && (
            <div style={{
              background: 'rgba(12,17,32,0.8)',
              border: '1px solid rgba(56,189,248,0.1)',
              borderLeft: '3px solid #38bdf8',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Mission
              </div>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
                {mission.body}
              </p>
            </div>
          )}
          {vision && (
            <div style={{
              background: 'rgba(12,17,32,0.8)',
              border: '1px solid rgba(16,185,129,0.1)',
              borderLeft: '3px solid #10b981',
              borderRadius: '0 0.5rem 0.5rem 0',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Vision
              </div>
              <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.65, margin: 0 }}>
                {vision.body}
              </p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {problem && problem.items && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Core Problem Statement
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {problem.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.75rem',
                  background: 'rgba(8,12,20,0.6)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: '0.5rem',
                }}>
                  <span style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 1,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v4M6 9h.01" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.55 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {users && users.tags && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              Target Users
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {users.tags.map((tag, i) => (
                <span key={i} style={{
                  fontSize: '0.72rem',
                  padding: '0.3rem 0.65rem',
                  background: 'rgba(56,189,248,0.06)',
                  border: '1px solid rgba(56,189,248,0.12)',
                  borderRadius: '9999px',
                  color: '#94a3b8',
                  fontWeight: 500,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeroSection() {
  const [lastLine, setLastLine] = useState(false);
  const [activeTab, setActiveTab] = useState<'platform' | 'about'>('platform');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLastLine(true), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="platform"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      <div
        className="grid-bg"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.4,
        }}
      />
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        height: 400,
        background: 'radial-gradient(ellipse, rgba(56,189,248,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '10%',
        width: 300,
        height: 300,
        background: 'radial-gradient(ellipse, rgba(20,184,166,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '5%',
        width: 250,
        height: 250,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem', width: '100%' }}>
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          marginBottom: '2.5rem',
          background: 'rgba(5,8,16,0.6)',
          border: '1px solid rgba(56,189,248,0.1)',
          borderRadius: '0.625rem',
          padding: '0.25rem',
          width: 'fit-content',
          animation: 'fade-up 0.5s ease forwards',
        }}>
          {(['platform', 'about'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1.5rem',
                borderRadius: '0.4rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                transition: 'all 0.2s ease',
                background: activeTab === tab ? 'rgba(56,189,248,0.12)' : 'transparent',
                color: activeTab === tab ? '#38bdf8' : '#475569',
                boxShadow: activeTab === tab ? 'inset 0 0 0 1px rgba(56,189,248,0.2)' : 'none',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'platform' ? 'Platform' : 'About'}
            </button>
          ))}
        </div>

        {activeTab === 'platform' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2.5rem' : '4rem',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ marginBottom: '1.5rem', animation: 'fade-up 0.6s ease forwards' }}>
                <span className="tag tag-cyan">
                  <span className="status-dot" style={{ width: 5, height: 5 }} />
                  Clinical AI Platform
                </span>
              </div>

              <h1 style={{
                fontSize: isMobile ? '1.75rem' : 'clamp(2.5rem, 4vw, 3.75rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
                margin: isMobile ? '0 0 0.9rem' : '0 0 1.5rem',
                animation: 'fade-up 0.6s ease 0.1s both',
              }}>
                <span style={{ color: '#f0f4ff' }}>Hospital Intelligence</span>
                <br />
                <span className="text-gradient-cyan">at the Speed of Care</span>
              </h1>

              <p style={{
                fontSize: isMobile ? '0.875rem' : '1.05rem',
                lineHeight: 1.65,
                color: '#94a3b8',
                maxWidth: 520,
                margin: isMobile ? '0 0 1rem' : '0 0 1.5rem',
                animation: 'fade-up 0.6s ease 0.2s both',
              }}>
                MediRangeX integrates real-time sepsis prediction, drug safety intelligence,
                operations forecasting, and ML model observability into a single unified
                command center — purpose-built for modern clinical environments.
              </p>

              <div style={{ animation: 'fade-up 0.6s ease 0.25s both', marginBottom: '1.75rem' }}>
                <RuntimeBanner />
              </div>

              <div style={{
                display: 'flex',
                gap: '0.6rem',
                marginBottom: isMobile ? '1.5rem' : '3rem',
                flexWrap: 'wrap',
                animation: 'fade-up 0.6s ease 0.3s both',
              }}>
                <button className="btn-primary" onClick={() => navigate('/dashboard/command-center')}>
                  View Dashboard
                  <span style={{ marginLeft: '0.4rem' }}>→</span>
                </button>
                <button className="btn-demo" onClick={() => scrollTo('clinical-demo')}>
                  <span style={{ marginRight: '0.4rem' }}>▶</span>
                  Live Clinical Demo
                </button>
                <button className="btn-ghost" onClick={() => scrollTo('architecture')}>
                  View Architecture
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                animation: 'fade-up 0.6s ease 0.4s both',
              }}>
                {LIVE_STATS.map((stat) => (
                  <div key={stat.label} style={{
                    background: 'rgba(12,17,32,0.8)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '0.75rem',
                    padding: '1rem 1.25rem',
                    transition: 'all 0.3s ease',
                  }}>
                    <div style={{
                      fontSize: isMobile ? '1.25rem' : '1.6rem',
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: stat.color,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}>
                      <AnimatedNumber target={stat.value} decimal={stat.decimal} />
                      <span style={{ fontSize: '0.9rem' }}>{stat.suffix}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.2rem', fontWeight: 500 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ animation: 'fade-up 0.7s ease 0.2s both' }}>
              <div
                className="scan-line"
                style={{
                  background: '#080c14',
                  border: '1px solid rgba(56,189,248,0.15)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 0 60px rgba(56,189,248,0.06), 0 30px 80px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(5,8,16,0.8)',
                  borderBottom: '1px solid rgba(56,189,248,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.72rem', color: '#475569', fontFamily: 'monospace' }}>
                    medirx-intelligence v2.4.1 — clinical runtime
                  </span>
                </div>

                <div style={{ padding: '1.25rem', minHeight: 280, display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  {TERMINAL_LINES.map((line, i) => (
                    <TerminalLine key={i} text={line.text} color={line.color} index={i} />
                  ))}
                  {lastLine && (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      fontSize: '0.72rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#38bdf8',
                      marginTop: '0.4rem',
                    }}>
                      <span>$</span>
                      <span className="animate-blink" style={{ borderRight: '2px solid #38bdf8', paddingRight: 2 }} />
                    </div>
                  )}
                </div>

                <div style={{
                  padding: '0.6rem 1rem',
                  borderTop: '1px solid rgba(56,189,248,0.08)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: isMobile ? '0.5rem 1rem' : '1.5rem',
                  alignItems: 'center',
                }}>
                  {[
                    { label: 'SEPSIS ENGINE', status: 'ONLINE', color: '#10b981' },
                    { label: 'DRUG SAFETY', status: 'ONLINE', color: '#10b981' },
                    { label: 'OPS ML', status: 'ONLINE', color: '#10b981' },
                    { label: 'DRIFT MONITOR', status: 'NORMAL', color: '#38bdf8' },
                  ].map((s) => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <div style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: s.color,
                        boxShadow: `0 0 6px ${s.color}`,
                        flexShrink: 0,
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem',
                marginTop: '0.75rem',
              }}>
                {[
                  { label: 'ICU Occupancy', value: '74%', trend: '+3%', trendUp: true, bar: 74, color: '#38bdf8' },
                  { label: 'ED Congestion Risk', value: 'MODERATE', badge: true, color: '#f59e0b' },
                  { label: 'Active Patients', value: '247', sub: '12 critical', color: '#10b981' },
                  { label: 'Drug Alerts (24h)', value: '18', sub: '3 critical', color: '#f43f5e' },
                ].map((item) => (
                  <div key={item.label} style={{
                    background: 'rgba(8,12,20,0.8)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '0.625rem',
                    padding: '0.875rem',
                    transition: 'border-color 0.2s ease',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(56,189,248,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
                  >
                    <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {item.label}
                    </div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: item.color,
                    }}>
                      {item.value}
                    </div>
                    {item.sub && (
                      <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '0.2rem' }}>{item.sub}</div>
                    )}
                    {item.trend && (
                      <div style={{ fontSize: '0.65rem', color: item.trendUp ? '#f59e0b' : '#10b981', marginTop: '0.2rem' }}>
                        {item.trend} from last hour
                      </div>
                    )}
                    {item.bar !== undefined && (
                      <div style={{ marginTop: '0.5rem', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                        <div style={{
                          height: '100%',
                          width: `${item.bar}%`,
                          background: item.color,
                          borderRadius: 2,
                          boxShadow: `0 0 8px ${item.color}`,
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AboutPanel />
        )}
      </div>

      <div style={{
        maxWidth: 1280,
        margin: '2.5rem auto 0',
        padding: '0 1.5rem',
        width: '100%',
        animation: 'fade-up 0.6s ease 0.5s both',
      }}>
        <div style={{
          background: 'rgba(8,12,20,0.7)',
          border: '1px solid rgba(148,163,184,0.08)',
          borderRadius: '0.625rem',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.625rem',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '0.1rem' }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p style={{ margin: 0, fontSize: '0.67rem', color: '#3d4f63', lineHeight: 1.6 }}>
            <strong style={{ color: '#475569', fontWeight: 600 }}>Important Disclosure:</strong> MediRangeX provides status reports and decision-support recommendations based on patient conditions, guided by standard and established national and international clinical guidelines. MediRangeX does not provide medical advice. The ultimate clinical decision authority rests exclusively with the treating physician and care team.
          </p>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          animation: 'float 3s ease-in-out infinite',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.3rem',
        }}
        onClick={() => scrollTo('clinical-demo')}
      >
        <span style={{ fontSize: '0.6rem', color: '#38bdf8', opacity: 0.6, letterSpacing: '0.08em', fontWeight: 600 }}>
          WATCH LIVE DEMO
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.5" style={{ opacity: 0.6 }}>
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </section>
  );
}
