import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';

const MOCK_VITALS = {
  hr: [88, 92, 95, 101, 108, 115, 124, 132, 128, 135],
  rr: [16, 17, 18, 19, 21, 24, 26, 28, 27, 30],
  sbp: [118, 115, 112, 108, 102, 96, 90, 85, 82, 78],
  temp: [37.2, 37.5, 37.8, 38.1, 38.4, 38.7, 39.0, 39.2, 39.4, 39.6],
};

const RISK_PROGRESSION = [0, 1, 2, 3, 4, 5, 6, 7, 8, 8];

const RISK_COLORS = ['#10b981', '#10b981', '#10b981', '#f59e0b', '#f59e0b', '#f97316', '#f97316', '#ef4444', '#ef4444', '#ef4444'];
const RISK_LABELS = ['Low', 'Low', 'Low', 'Moderate', 'Moderate', 'High', 'High', 'Critical', 'Critical', 'Critical'];

function MiniSparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 120;
  const h = height;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${color.replace('#','')})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(values.length - 1) / (values.length - 1) * w}
        cy={h - ((values[values.length - 1] - min) / range) * (h - 4) - 2}
        r="3"
        fill={color}
      />
    </svg>
  );
}

export default function IntelligenceSection() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setStep(s => (s + 1) % 10);
      }, 1200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const score = RISK_PROGRESSION[step];
  const riskColor = RISK_COLORS[step];
  const riskLabel = RISK_LABELS[step];

  const vitalsNow = {
    hr: MOCK_VITALS.hr[step],
    rr: MOCK_VITALS.rr[step],
    sbp: MOCK_VITALS.sbp[step],
    temp: MOCK_VITALS.temp[step],
  };

  return (
    <section id="sepsis-demo" style={{ padding: isMobile ? '4rem 0' : '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '2rem' : '4rem', alignItems: 'center' }}>
          <div>
            <span className="tag tag-emerald" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
              Live Intelligence Demo
            </span>
            <h2 style={{
              fontSize: 'clamp(1.75rem, 2.5vw, 2.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              margin: '1rem 0 1.5rem',
              color: '#f0f4ff',
              lineHeight: 1.2,
            }}>
              Watch Sepsis Risk<br />
              <span className="text-gradient-cyan">Evolve in Real Time</span>
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              This simulation shows how MediRangeX continuously monitors vital signs and
              escalates risk scores as a patient deteriorates — alerting clinicians before
              standard protocols would trigger.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'SIRS Criteria scored in real time', icon: '✓', color: '#10b981' },
                { label: 'Hypoperfusion markers tracked continuously', icon: '✓', color: '#10b981' },
                { label: 'Automated escalation with clinical rationale', icon: '✓', color: '#10b981' },
                { label: 'Zero-configuration clinical integration', icon: '✓', color: '#38bdf8' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: `${item.color}20`,
                    border: `1px solid ${item.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: item.color,
                    flexShrink: 0,
                    fontWeight: 700,
                  }}>
                    {item.icon}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn-primary"
                onClick={() => setRunning(r => !r)}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                {running ? (
                  <>
                    <span style={{ marginRight: '0.4rem' }}>⏸</span> Pause
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '0.4rem' }}>▶</span> Resume
                  </>
                )}
              </button>
              <button
                className="btn-ghost"
                onClick={() => setStep(0)}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                Reset
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(8,12,20,0.9)',
              border: `1px solid ${riskColor}33`,
              borderRadius: '1rem',
              padding: '1.5rem',
              transition: 'border-color 0.4s ease',
              boxShadow: `0 0 40px ${riskColor}08`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
                    Patient ID: MRN-00427
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
                    John D. · ICU Bay 3 · Age 64
                  </div>
                </div>
                <div style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  background: `${riskColor}20`,
                  border: `1px solid ${riskColor}40`,
                  color: riskColor,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  transition: 'all 0.4s ease',
                }}>
                  {riskLabel.toUpperCase()} RISK
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#475569', marginBottom: '0.2rem' }}>Sepsis Risk Score</div>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: 900,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: riskColor,
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                    transition: 'color 0.4s ease',
                  }}>
                    {score}
                    <span style={{ fontSize: '1.2rem', color: '#475569', fontWeight: 400 }}>/12</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '0.5rem' }}>
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 2,
                        background: i < score ? riskColor : 'rgba(255,255,255,0.06)',
                        transition: 'background 0.3s ease',
                        boxShadow: i < score ? `0 0 4px ${riskColor}80` : 'none',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>0 — Low</span>
                    <span>12 — Critical</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                {[
                  { label: 'Heart Rate', value: vitalsNow.hr, unit: 'bpm', data: MOCK_VITALS.hr.slice(0, step + 1), normal: [60, 100], color: '#f43f5e' },
                  { label: 'Resp. Rate', value: vitalsNow.rr, unit: '/min', data: MOCK_VITALS.rr.slice(0, step + 1), normal: [12, 20], color: '#f59e0b' },
                  { label: 'Systolic BP', value: vitalsNow.sbp, unit: 'mmHg', data: MOCK_VITALS.sbp.slice(0, step + 1), normal: [90, 140], color: '#38bdf8' },
                  { label: 'Temperature', value: vitalsNow.temp.toFixed(1), unit: '°C', data: MOCK_VITALS.temp.slice(0, step + 1), normal: [36.5, 37.5], color: '#f97316' },
                ].map((vital) => {
                  const numVal = typeof vital.value === 'string' ? parseFloat(vital.value) : vital.value;
                  const isAbnormal = numVal < vital.normal[0] || numVal > vital.normal[1];
                  return (
                    <div key={vital.label} style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isAbnormal ? vital.color + '33' : 'rgba(255,255,255,0.04)'}`,
                      borderRadius: '0.5rem',
                      padding: '0.625rem 0.75rem',
                      transition: 'all 0.3s ease',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <div style={{ fontSize: '0.65rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {vital.label}
                        </div>
                        {isAbnormal && (
                          <div style={{ width: 5, height: 5, borderRadius: '50%', background: vital.color, flexShrink: 0, boxShadow: `0 0 6px ${vital.color}` }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.375rem' }}>
                        <span style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isAbnormal ? vital.color : '#e2e8f0',
                          transition: 'color 0.3s ease',
                        }}>
                          {vital.value}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#475569' }}>{vital.unit}</span>
                      </div>
                      {vital.data.length > 1 && (
                        <MiniSparkline values={vital.data} color={isAbnormal ? vital.color : '#334155'} height={28} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {score >= 5 && (
              <div style={{
                background: 'rgba(244,63,94,0.05)',
                border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f43f5e', boxShadow: '0 0 8px #f43f5e', marginTop: 3 }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f43f5e' }}>
                    SEPSIS ALERT — Immediate Action Required
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Recommend: Blood cultures ×2 · Broad-spectrum antibiotics · Lactate measurement ·
                  IV fluid resuscitation · Urgent ICU review
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
