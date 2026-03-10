import { useState } from 'react';

const STACK_LAYERS = [
  {
    label: 'Presentation Layer',
    items: ['React 19 + TypeScript', 'Recharts Visualizations', 'Real-time Dashboard', 'Role-gated UI Components'],
    color: '#38bdf8',
    dimColor: 'rgba(56,189,248,0.06)',
    borderColor: 'rgba(56,189,248,0.15)',
  },
  {
    label: 'API Gateway',
    items: ['FastAPI + Python', 'JWT Authentication', 'RBAC Middleware', 'OpenAPI Schema'],
    color: '#818cf8',
    dimColor: 'rgba(129,140,248,0.06)',
    borderColor: 'rgba(129,140,248,0.15)',
  },
  {
    label: 'Clinical Intelligence',
    items: ['Sepsis Engine v2.4', 'Drug Safety Engine', 'Ops Forecast Engine', 'Clinical Reasoning'],
    color: '#10b981',
    dimColor: 'rgba(16,185,129,0.06)',
    borderColor: 'rgba(16,185,129,0.15)',
  },
  {
    label: 'ML Platform',
    items: ['Statistical Forecasting', 'Hybrid ML Models', 'Drift Detection', 'Prediction Audit Logs'],
    color: '#f59e0b',
    dimColor: 'rgba(245,158,11,0.06)',
    borderColor: 'rgba(245,158,11,0.15)',
  },
  {
    label: 'Data & Knowledge',
    items: ['PostgreSQL + SQLAlchemy', 'Alembic Migrations', 'Knowledge Bank JSON', 'LOINC/SNOMED/RxNorm'],
    color: '#14b8a6',
    dimColor: 'rgba(20,184,166,0.06)',
    borderColor: 'rgba(20,184,166,0.15)',
  },
];

const TECH_BADGES: { name: string; color: string; desc: string }[] = [
  { name: 'FastAPI', color: '#10b981', desc: 'High-performance async Python web framework' },
  { name: 'React 19', color: '#38bdf8', desc: 'Modern UI library with concurrent rendering' },
  { name: 'Python 3.11', color: '#f59e0b', desc: 'Core backend language for clinical engines' },
  { name: 'PostgreSQL', color: '#818cf8', desc: 'Relational database for patient and audit data' },
  { name: 'SQLAlchemy', color: '#14b8a6', desc: 'ORM for type-safe database interactions' },
  { name: 'Alembic', color: '#f43f5e', desc: 'Database migration and schema versioning' },
  { name: 'JWT Auth', color: '#f97316', desc: 'JSON Web Token authentication and session management' },
  { name: 'Recharts', color: '#38bdf8', desc: 'Composable charting library for dashboards' },
  { name: 'TypeScript', color: '#818cf8', desc: 'Type-safe JavaScript for frontend reliability' },
  { name: 'Vite 7', color: '#f59e0b', desc: 'Next-generation frontend build tool' },
  { name: 'Tailwind CSS 4', color: '#10b981', desc: 'Utility-first CSS framework' },
  { name: 'LOINC', color: '#94a3b8', desc: 'Logical Observation Identifiers for lab data' },
  { name: 'SNOMED CT', color: '#94a3b8', desc: 'Clinical terminology for diagnoses and procedures' },
  { name: 'ICD-10', color: '#94a3b8', desc: 'International classification of diseases' },
  { name: 'RxNorm', color: '#94a3b8', desc: 'Normalized drug naming system by NLM' },
];

const API_ENDPOINTS = [
  { method: 'POST', path: '/auth/login', desc: 'JWT token exchange', color: '#38bdf8', curl: "curl -X POST /api/auth/login -H 'Content-Type: application/json' -d '{\"username\": \"admin\", \"password\": \"***\"}'" },
  { method: 'POST', path: '/predict/sepsis-risk', desc: 'Evaluate sepsis score', color: '#f43f5e', role: 'clinician', curl: "curl -X POST /api/predict/sepsis-risk -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{\"patient_id\": \"uuid\", \"heart_rate\": 105, \"respiratory_rate\": 24, \"temperature_celsius\": 38.5, \"systolic_bp\": 88, \"care_setting\": \"ICU\"}'" },
  { method: 'POST', path: '/check/drug-interactions', desc: 'Drug safety check', color: '#f59e0b', role: 'pharmacist', curl: "curl -X POST /api/check/drug-interactions -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{\"patient_id\": \"uuid\", \"drugs\": [{\"drug_name\": \"warfarin\"}, {\"drug_name\": \"ibuprofen\"}]}'" },
  { method: 'POST', path: '/forecast/operations-ml', desc: 'ML capacity forecast', color: '#818cf8', role: 'data_scientist', curl: "curl -X POST /api/forecast/operations-ml -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{\"raw_input\": {\"icu_occupancy_percent\": 85}}'" },
  { method: 'POST', path: '/reason/clinical-pathway', desc: 'Evidence pathway', color: '#10b981', role: 'clinician', curl: "curl -X POST /api/reason/clinical-pathway -H 'Authorization: Bearer <token>' -H 'Content-Type: application/json' -d '{\"patient_id\": \"uuid\", \"primary_diagnosis\": \"sepsis\", \"care_setting\": \"ICU\"}'" },
  { method: 'GET', path: '/dashboard/command-center', desc: 'Unified dashboard', color: '#14b8a6', role: 'admin', curl: "curl -X GET /api/command-center -H 'Authorization: Bearer <token>'" },
  { method: 'GET', path: '/ml/logs', desc: 'ML prediction audit', color: '#f97316', role: 'admin', curl: "curl -X GET '/api/ml/logs?domain=operations&limit=50' -H 'Authorization: Bearer <token>'" },
];

export default function ArchitectureSection() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = async (curl: string, path: string) => {
    try {
      await navigator.clipboard.writeText(curl);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 1500);
    } catch {
      // fallback ignored
    }
  };

  return (
    <section id="architecture" style={{ padding: '7rem 0', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span className="tag tag-cyan" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            Architecture
          </span>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '1rem 0 1rem',
            color: '#f0f4ff',
          }}>
            Production-Grade Clinical Stack
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: 540, margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            Five cohesive layers from database to browser, all interconnected through
            a clean, documented API surface.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {STACK_LAYERS.map((layer, i) => (
              <div key={layer.label} style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0.875rem' }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: layer.color,
                    boxShadow: `0 0 8px ${layer.color}80`,
                    flexShrink: 0,
                  }} />
                  {i < STACK_LAYERS.length - 1 && (
                    <div style={{
                      width: 1,
                      height: 40,
                      background: `linear-gradient(${layer.color}60, ${STACK_LAYERS[i + 1].color}40)`,
                      marginTop: 4,
                    }} />
                  )}
                </div>
                <div style={{
                  flex: 1,
                  background: layer.dimColor,
                  border: `1px solid ${layer.borderColor}`,
                  borderRadius: '0.75rem',
                  padding: '0.875rem 1rem',
                  marginBottom: i < STACK_LAYERS.length - 1 ? '0.25rem' : 0,
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: layer.color, marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
                    {layer.label}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {layer.items.map(item => (
                      <span key={item} style={{
                        padding: '0.2rem 0.6rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '0.3rem',
                        fontSize: '0.72rem',
                        color: '#94a3b8',
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{
              background: 'rgba(8,12,20,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1rem',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <div id="api-surface" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  API Surface — /api endpoints
                </span>
                <span style={{ fontSize: '0.6rem', color: '#334155', fontStyle: 'italic' }}>
                  Click to copy curl
                </span>
              </div>
              {API_ENDPOINTS.map((ep) => (
                <div
                  key={ep.path}
                  className="data-line"
                  style={{ cursor: 'pointer', transition: 'background 0.15s ease', borderRadius: '0.25rem', padding: '0.5rem 0.25rem', margin: '0 -0.25rem' }}
                  onClick={() => handleCopy(ep.curl, ep.path)}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span style={{
                      padding: '0.1rem 0.4rem',
                      background: `${ep.color}15`,
                      border: `1px solid ${ep.color}30`,
                      borderRadius: '0.25rem',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      color: ep.color,
                      fontFamily: 'monospace',
                      letterSpacing: '0.04em',
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: "'JetBrains Mono', monospace", color: '#e2e8f0' }}>
                      {ep.path}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {copiedPath === ep.path ? (
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 600, animation: 'fade-up 0.2s ease forwards' }}>
                        Copied!
                      </span>
                    ) : (
                      <>
                        <span style={{ fontSize: '0.7rem', color: '#475569' }}>{ep.desc}</span>
                        {ep.role && (
                          <span style={{
                            padding: '0.1rem 0.4rem',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '0.25rem',
                            fontSize: '0.6rem',
                            color: '#475569',
                            fontFamily: 'monospace',
                          }}>
                            {ep.role}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              background: 'rgba(8,12,20,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.875rem' }}>
                Technology Stack
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {TECH_BADGES.map(({ name, color, desc }) => (
                  <span
                    key={name}
                    className="cmd-tooltip"
                    data-tip={desc}
                    style={{
                      padding: '0.25rem 0.625rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${color}25`,
                      borderRadius: '0.375rem',
                      fontSize: '0.72rem',
                      color,
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${color}15`;
                      e.currentTarget.style.borderColor = `${color}50`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = `${color}25`;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
