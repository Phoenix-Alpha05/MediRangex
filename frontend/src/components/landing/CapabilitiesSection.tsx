import { useState } from 'react';

const CAPABILITIES = [
  {
    id: 'sepsis',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Sepsis Risk Prediction',
    subtitle: 'Real-time SIRS + Hypoperfusion Scoring',
    color: '#f43f5e',
    dimColor: 'rgba(244,63,94,0.1)',
    tag: 'CLINICIAN',
    description: 'Continuously evaluates 12-point risk scores against SIRS criteria, hypoperfusion markers, and patient-specific vitals. Flags deterioration hours before clinical presentation.',
    metrics: [
      { label: 'Score Range', value: '0–12+' },
      { label: 'Risk Levels', value: '4 tiers' },
      { label: 'Response', value: '<50ms' },
    ],
    details: [
      'Heart rate, respiratory rate, temperature, systolic BP',
      'WBC count and lactate level integration',
      'Care setting context (ICU / Ward / ED)',
      'Triggered factor reasoning with clinical rationale',
      'Evidence-based recommended actions per risk tier',
    ],
  },
  {
    id: 'drug',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Drug Safety Engine',
    subtitle: 'Interaction Detection with Context Modifiers',
    color: '#f59e0b',
    dimColor: 'rgba(245,158,11,0.1)',
    tag: 'PHARMACIST',
    description: 'Analyzes polypharmacy risks using RxNorm-coded medications with intelligent context modifiers: renal impairment, pregnancy, QTc prolongation, INR, and more.',
    metrics: [
      { label: 'Interactions', value: '847+' },
      { label: 'Context Signals', value: '9 types' },
      { label: 'Confidence', value: 'Graded' },
    ],
    details: [
      'eGFR-adjusted dosing recommendations',
      'QTc interval risk stratification',
      'Pregnancy safety classification',
      'INR and anticoagulation overlap detection',
      'Severity escalation based on patient context',
    ],
  },
  {
    id: 'ops',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round"/>
        <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Operations Forecasting',
    subtitle: 'Capacity Risk & Surge Intelligence',
    color: '#38bdf8',
    dimColor: 'rgba(56,189,248,0.1)',
    tag: 'DATA SCIENCE',
    description: 'Multi-horizon ICU and bed capacity predictions using hybrid statistical + ML models. Real-time surge detection across ICU, beds, ED, ventilators, and staffing.',
    metrics: [
      { label: 'Forecast Horizons', value: '6h / 24h' },
      { label: 'Model Type', value: 'Hybrid ML' },
      { label: 'Confidence', value: 'CI bands' },
    ],
    details: [
      'ICU occupancy forecasts with confidence intervals',
      'ED congestion probability scoring',
      'Staffing overload early warning system',
      'Ventilator utilization trend tracking',
      'Surge threshold alerts: NORMAL / STRAINED / SURGE',
    ],
  },
  {
    id: 'ml',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" strokeLinecap="round"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" strokeLinecap="round"/>
      </svg>
    ),
    title: 'ML Observability',
    subtitle: 'Model Drift Detection & Monitoring',
    color: '#818cf8',
    dimColor: 'rgba(129,140,248,0.1)',
    tag: 'ADMIN',
    description: 'Continuous model performance monitoring with drift detection, prediction confidence tracking, and comprehensive audit trails for all ML-driven clinical decisions.',
    metrics: [
      { label: 'Audit Trail', value: 'Full' },
      { label: 'Drift Monitor', value: 'Real-time' },
      { label: 'Log Retention', value: '90 days' },
    ],
    details: [
      'Prediction log storage with full context',
      'Model version tracking and rollback capability',
      'Confidence distribution analytics',
      'Drift score computation and alerts',
      'Per-model performance dashboards',
    ],
  },
  {
    id: 'reason',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Clinical Reasoning',
    subtitle: 'Evidence-Based Pathway Generation',
    color: '#14b8a6',
    dimColor: 'rgba(20,184,166,0.1)',
    tag: 'CLINICIAN',
    description: 'Generates structured, evidence-based clinical pathways and differential diagnosis support from the MediRangeX knowledge bank — grounded in real clinical guidelines.',
    metrics: [
      { label: 'Knowledge Base', value: 'Modular' },
      { label: 'Standards', value: 'LOINC/ICD-10' },
      { label: 'Output', value: 'Structured' },
    ],
    details: [
      'Clinical pathway recommendations by condition',
      'Differential diagnosis with likelihood scoring',
      'LOINC-coded laboratory finding support',
      'SNOMED CT and ICD-10 integration',
      'RxNorm medication code mapping',
    ],
  },
  {
    id: 'dashboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Command Center',
    subtitle: 'Unified Real-Time Situational Awareness',
    color: '#10b981',
    dimColor: 'rgba(16,185,129,0.1)',
    tag: 'ADMIN',
    description: 'A single-pane-of-glass view aggregating clinical risk, medication safety, operations status, and ML health into one real-time dashboard with 60-second auto-refresh.',
    metrics: [
      { label: 'Refresh Rate', value: '60s' },
      { label: 'Data Domains', value: '5 streams' },
      { label: 'Access', value: 'Role-gated' },
    ],
    details: [
      'System status: NORMAL / STRAINED / SURGE',
      'High-risk patient count with deterioration trends',
      'Medication safety critical alert summary',
      'Operations capacity risk across 5 dimensions',
      'Active ML model version and drift status',
    ],
  },
];

export default function CapabilitiesSection() {
  const [activeId, setActiveId] = useState('sepsis');
  const active = CAPABILITIES.find(c => c.id === activeId) ?? CAPABILITIES[0];

  return (
    <section id="capabilities" style={{ padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="tag tag-cyan" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            Capabilities
          </span>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '1rem 0 1rem',
            color: '#f0f4ff',
          }}>
            Six Domains of Clinical Intelligence
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            Purpose-built modules that integrate seamlessly into clinical workflows,
            each enforced by role-based access controls.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {CAPABILITIES.map((cap) => (
              <button
                key={cap.id}
                onClick={() => setActiveId(cap.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.875rem 1rem',
                  borderRadius: '0.625rem',
                  border: `1px solid ${activeId === cap.id ? cap.color + '33' : 'rgba(255,255,255,0.05)'}`,
                  background: activeId === cap.id ? cap.dimColor : 'rgba(8,12,20,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  textAlign: 'left',
                  width: '100%',
                }}
                onMouseEnter={e => {
                  if (activeId !== cap.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeId !== cap.id) {
                    e.currentTarget.style.background = 'rgba(8,12,20,0.5)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '0.5rem',
                  background: activeId === cap.id ? cap.dimColor : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeId === cap.id ? cap.color + '33' : 'rgba(255,255,255,0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: activeId === cap.id ? cap.color : '#475569',
                  flexShrink: 0,
                  transition: 'all 0.25s ease',
                }}>
                  {cap.icon}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: activeId === cap.id ? '#f0f4ff' : '#94a3b8',
                    transition: 'color 0.2s ease',
                    marginBottom: '0.15rem',
                  }}>
                    {cap.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569' }}>
                    {cap.subtitle}
                  </div>
                </div>
                {activeId === cap.id && (
                  <div style={{ marginLeft: 'auto', color: cap.color, flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <div
            key={active.id}
            style={{
              background: 'rgba(8,12,20,0.8)',
              border: `1px solid ${active.color}22`,
              borderRadius: '1rem',
              padding: '2rem',
              animation: 'fade-up 0.3s ease forwards',
              boxShadow: `0 0 40px ${active.color}08`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '0.75rem',
                  background: active.dimColor,
                  border: `1px solid ${active.color}33`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: active.color,
                }}>
                  {active.icon}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                    {active.title}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>
                    {active.subtitle}
                  </div>
                </div>
              </div>
              <span className="tag" style={{
                background: active.dimColor,
                border: `1px solid ${active.color}33`,
                color: active.color,
              }}>
                {active.tag}
              </span>
            </div>

            <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              {active.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
              {active.metrics.map((m) => (
                <div key={m.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '0.625rem',
                  padding: '0.875rem',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: active.color, fontFamily: "'JetBrains Mono', monospace" }}>
                    {m.value}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.2rem' }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                Key Signals & Features
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {active.details.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <div style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: active.color,
                      flexShrink: 0,
                      marginTop: '0.45rem',
                    }} />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
