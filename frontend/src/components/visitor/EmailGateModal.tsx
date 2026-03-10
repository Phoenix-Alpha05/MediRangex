import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  onEmailConfirmed: (email: string) => void;
}

type FormState = 'idle' | 'submitting' | 'error';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(8,12,20,0.9)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '0.5rem',
  color: '#f0f4ff',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export function EmailGateModal({ onEmailConfirmed }: Props) {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      await supabase.from('visitor_log').insert({
        email: trimmed,
        user_agent: navigator.userAgent,
      });
      onEmailConfirmed(trimmed);
    } catch {
      setFormState('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'rgba(0,0,0,0.82)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#0d1219',
          border: '1px solid rgba(56,189,248,0.15)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(56,189,248,0.06)',
          overflow: 'hidden',
          animation: 'modalScaleIn 0.25s ease',
        }}
      >
        <div style={{
          padding: '2rem 2rem 1.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(14,165,233,0.08))',
            border: '1px solid rgba(56,189,248,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>

          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: '#f0f4ff',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Welcome to MediRangeX
          </h2>
          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            margin: '0 0 1.75rem',
            lineHeight: 1.6,
          }}>
            Enter your email to access the live demo. We use this to know who's checking out our platform.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.45)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            />

            {errorMsg && (
              <div style={{
                padding: '0.5rem 0.75rem',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.4rem',
                fontSize: '0.8rem',
                color: '#ef4444',
                textAlign: 'left',
              }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={formState === 'submitting'}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: formState === 'submitting'
                  ? 'rgba(56,189,248,0.4)'
                  : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: formState === 'submitting' ? 'wait' : 'pointer',
                letterSpacing: '0.01em',
                transition: 'opacity 0.2s ease, transform 0.1s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (formState !== 'submitting') e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              {formState === 'submitting' ? 'Entering...' : 'Enter Demo'}
            </button>
          </form>

          <p style={{
            fontSize: '0.72rem',
            color: '#334155',
            margin: '1rem 0 0',
            lineHeight: 1.5,
          }}>
            Your email is only used to track demo access. We won't spam you.
          </p>
        </div>
      </div>
    </div>
  );
}
