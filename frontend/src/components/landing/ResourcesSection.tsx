import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';

const CORRECT_PASSWORD = '1255657';

interface Resource {
  id: string;
  label: string;
  description: string;
  meta: string;
  locked: boolean;
  action?: () => void;
}

function LockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

function FileIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function PasswordModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (value === CORRECT_PASSWORD) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setShaking(true);
      setValue('');
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fade-up 0.2s ease forwards',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#0a0f1e',
          border: `1px solid ${error ? 'rgba(244,63,94,0.3)' : 'rgba(56,189,248,0.15)'}`,
          borderRadius: '1rem',
          padding: '2.5rem',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: shaking ? 'shake 0.4s ease' : undefined,
          transition: 'border-color 0.2s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        <div style={{
          width: 48,
          height: 48,
          borderRadius: '0.75rem',
          background: 'rgba(56,189,248,0.08)',
          border: '1px solid rgba(56,189,248,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          color: '#38bdf8',
        }}>
          <LockIcon size={22} />
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f4ff', margin: '0 0 0.5rem' }}>
          Access Platform Specification
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
          This document is restricted. Enter your access code to view the complete 14-section enterprise architecture specification.
        </p>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
            Access Code
          </label>
          <input
            ref={inputRef}
            type="password"
            value={value}
            onChange={e => { setValue(e.target.value); setError(false); }}
            onKeyDown={handleKeyDown}
            placeholder="Enter access code"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              background: 'rgba(5,8,16,0.8)',
              border: `1px solid ${error ? 'rgba(244,63,94,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '0.5rem',
              color: '#f0f4ff',
              fontSize: '0.9rem',
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              letterSpacing: '0.15em',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s ease',
            }}
          />
          {error && (
            <p style={{ fontSize: '0.75rem', color: '#f43f5e', marginTop: '0.5rem', margin: '0.4rem 0 0' }}>
              Incorrect access code. Please try again.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              color: '#475569',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#475569'; }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              flex: 2,
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Unlock Document
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResourcesSection() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const RESOURCES: Resource[] = [
    {
      id: 'dashboard',
      label: 'Command Center',
      description: 'Real-time clinical AI dashboard with sepsis prediction, drug safety alerts, and operational forecasting.',
      meta: 'Live App · Enterprise',
      locked: false,
      action: () => navigate('/dashboard/command-center'),
    },
    {
      id: 'demo',
      label: 'Live Clinical Demo',
      description: 'Interactive demonstration of the sepsis prediction engine and patient risk stratification in real time.',
      meta: 'Interactive · Public',
      locked: false,
      action: () => scrollTo('clinical-demo'),
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      description: 'Seven-layer intelligence infrastructure overview — from data ingestion through decision support.',
      meta: 'Technical · Public',
      locked: false,
      action: () => scrollTo('architecture'),
    },
    {
      id: 'spec',
      label: 'Platform Specification',
      description: 'Complete 14-section enterprise architecture document. Intended for clinical leadership, CIOs, health system administrators, and digital health investors.',
      meta: '14 Sections · Restricted',
      locked: true,
      action: () => setShowPasswordModal(true),
    },
  ];

  return (
    <section id="resources" style={{ padding: isMobile ? '4rem 0' : '7rem 0', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.15), transparent)',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Resources & Documentation
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            color: '#f0f4ff',
            margin: '0 0 0.75rem',
            lineHeight: 1.15,
          }}>
            Everything You Need<br />
            <span className="text-gradient-cyan">to Evaluate MediRangeX</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#475569', maxWidth: 520, lineHeight: 1.7 }}>
            Access live demos, technical documentation, and enterprise specifications to evaluate the platform for your health system.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {RESOURCES.map((resource, index) => (
            <div
              key={resource.id}
              onClick={resource.action}
              onMouseEnter={() => setHoveredId(resource.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: isMobile ? 'wrap' : undefined,
                gap: isMobile ? '0.875rem' : '1.5rem',
                padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem',
                background: hoveredId === resource.id
                  ? 'rgba(12,17,32,0.9)'
                  : 'rgba(8,12,20,0.6)',
                border: `1px solid ${hoveredId === resource.id
                  ? (resource.locked ? 'rgba(244,63,94,0.15)' : 'rgba(56,189,248,0.15)')
                  : 'rgba(255,255,255,0.05)'}`,
                borderRadius: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: hoveredId === resource.id ? 'translateX(4px)' : 'translateX(0)',
                animation: `fade-up 0.5s ease ${index * 0.08}s both`,
              }}
            >
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#1e293b',
                minWidth: '2rem',
                textAlign: 'right',
                userSelect: 'none',
              }}>
                {String(index + 1).padStart(2, '0')}
              </div>

              <div style={{
                width: 40,
                height: 40,
                borderRadius: '0.625rem',
                background: resource.locked
                  ? 'rgba(244,63,94,0.08)'
                  : 'rgba(56,189,248,0.08)',
                border: `1px solid ${resource.locked ? 'rgba(244,63,94,0.15)' : 'rgba(56,189,248,0.12)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: resource.locked ? '#f43f5e' : '#38bdf8',
                transition: 'all 0.25s ease',
              }}>
                {resource.locked ? <LockIcon size={16} /> : <FileIcon size={16} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                  <span style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#f0f4ff',
                  }}>
                    {resource.label}
                  </span>
                  {resource.locked && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#f43f5e',
                      background: 'rgba(244,63,94,0.08)',
                      border: '1px solid rgba(244,63,94,0.2)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                    }}>
                      Password Protected
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.55 }}>
                  {resource.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                flexShrink: 0,
              }}>
                <span style={{
                  fontSize: '0.72rem',
                  color: '#334155',
                  fontFamily: "'JetBrains Mono', monospace",
                  whiteSpace: 'nowrap',
                }}>
                  {resource.meta}
                </span>
                <div style={{
                  color: resource.locked
                    ? (hoveredId === resource.id ? '#f43f5e' : '#334155')
                    : (hoveredId === resource.id ? '#38bdf8' : '#334155'),
                  transition: 'color 0.2s ease',
                }}>
                  {resource.locked ? <LockIcon size={14} /> : <ArrowIcon size={14} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            setShowPasswordModal(false);
            navigate('/platform-spec');
          }}
        />
      )}
    </section>
  );
}
