import { useState, useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ROLES = [
  { value: 'clinician', label: 'Clinician' },
  { value: 'pharmacist', label: 'Pharmacist' },
  { value: 'admin', label: 'Administrator' },
  { value: 'data_scientist', label: 'Data Scientist' },
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem 0.875rem',
  background: 'rgba(8,12,20,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  color: '#f0f4ff',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#94a3b8',
  letterSpacing: '0.04em',
  textTransform: 'uppercase' as const,
  marginBottom: '0.4rem',
};

export default function RequestAccessModal({ open, onClose }: Props) {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [role, setRole] = useState('clinician');
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setFormState('idle');
      setErrorMsg('');
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !institution.trim()) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      setFormState('success');
    } catch {
      setFormState('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  const handleReset = () => {
    setName('');
    setInstitution('');
    setRole('clinician');
    setEmail('');
    setFormState('idle');
    setErrorMsg('');
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          animation: 'overlayFadeIn 0.2s ease',
        }}
      />
      <div
        ref={contentRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          background: '#0d1219',
          border: '1px solid rgba(56,189,248,0.12)',
          borderRadius: '12px',
          animation: 'modalScaleIn 0.2s ease',
          boxShadow: '0 16px 64px rgba(0,0,0,0.5), 0 0 40px rgba(56,189,248,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: '#111820',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4ff', letterSpacing: '-0.01em' }}>
              Request Access
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.15rem' }}>
              Join our clinical pilot program
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              padding: '4px 6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {formState === 'success' ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.5rem' }}>
                Request Submitted
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Our clinical team will review your application and reach out within 24 hours.
              </div>
              <button
                className="btn-ghost"
                onClick={() => { handleReset(); onClose(); }}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dr. Jane Smith"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Institution</label>
                <input
                  type="text"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="St. Mary's Medical Center"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={labelStyle}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${role === r.value ? 'rgba(56,189,248,0.35)' : 'rgba(255,255,255,0.08)'}`,
                        background: role === r.value ? 'rgba(56,189,248,0.08)' : 'rgba(8,12,20,0.6)',
                        color: role === r.value ? '#38bdf8' : '#94a3b8',
                        fontSize: '0.8rem',
                        fontWeight: role === r.value ? 600 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Institutional Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane.smith@hospital.org"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(56,189,248,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {errorMsg && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '0.375rem',
                  fontSize: '0.8rem',
                  color: '#ef4444',
                }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={formState === 'submitting'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                  marginTop: '0.25rem',
                  opacity: formState === 'submitting' ? 0.7 : 1,
                  cursor: formState === 'submitting' ? 'wait' : 'pointer',
                }}
              >
                {formState === 'submitting' ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
