import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const ADMIN_EMAILS = ['rangex.corp@gmail.com', 'dr.narendra0005@gmail.com'];

interface Props {
  onLoginSuccess: (email: string, isAdmin: boolean) => void;
}

type Step = 'email' | 'password';
type FormState = 'idle' | 'submitting' | 'error';

export function EmailGateModal({ onLoginSuccess }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => setVisible(true), 60);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, []);

  const isAdminEmail = (val: string) =>
    ADMIN_EMAILS.includes(val.trim().toLowerCase());

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (isAdminEmail(trimmed)) {
      setStep('password');
      setFormState('idle');
      setErrorMsg('');
      return;
    }

    setFormState('submitting');
    setErrorMsg('');

    try {
      await supabase.from('visitor_log').insert({
        email: trimmed,
        user_agent: navigator.userAgent,
      });

      fetch(`${SUPABASE_URL}/functions/v1/notify-admin`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorEmail: trimmed, accessedAt: new Date().toISOString() }),
      }).catch(() => {});

      onLoginSuccess(trimmed, false);
    } catch {
      setFormState('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/platform-auth`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormState('error');
        setErrorMsg('Incorrect password. Please try again.');
        return;
      }

      onLoginSuccess(email.trim(), true);
    } catch {
      setFormState('error');
      setErrorMsg('Something went wrong. Please try again.');
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setPassword('');
    setFormState('idle');
    setErrorMsg('');
  };

  return (
    <>
      <style>{`
        @keyframes mrx-gate-in {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes mrx-pulse-ring {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes mrx-shimmer-border {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes mrx-fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mrx-step-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .mrx-gate-card {
          animation: mrx-gate-in 0.45s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .mrx-copy-1 { animation: mrx-fade-up 0.5s 0.2s ease both; }
        .mrx-copy-2 { animation: mrx-fade-up 0.5s 0.35s ease both; }
        .mrx-copy-3 { animation: mrx-fade-up 0.5s 0.5s ease both; }
        .mrx-copy-4 { animation: mrx-fade-up 0.5s 0.6s ease both; }
        .mrx-step-in { animation: mrx-step-in 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .mrx-proceed-btn {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .mrx-proceed-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent);
          transition: left 0.4s ease;
        }
        .mrx-proceed-btn:hover::before { left: 150%; }
        .mrx-proceed-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(56,189,248,0.3); }
        .mrx-proceed-btn:active { transform: translateY(0); }
        .mrx-input:focus {
          border-color: rgba(56,189,248,0.5) !important;
          box-shadow: 0 0 0 3px rgba(56,189,248,0.06) !important;
        }
        .mrx-back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          font-size: 0.75rem;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          transition: color 0.15s;
        }
        .mrx-back-btn:hover { color: #94a3b8; }
        .mrx-pw-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 0 10px;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .mrx-pw-toggle:hover { color: #94a3b8; }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(2,6,14,0.92)',
        backdropFilter: 'blur(12px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <div
          className="mrx-gate-card"
          style={{
            width: '100%', maxWidth: '460px',
            background: 'linear-gradient(160deg, #0c1220 0%, #080e1a 60%, #050911 100%)',
            border: '1px solid rgba(56,189,248,0.14)',
            borderRadius: '20px',
            boxShadow: '0 32px 100px rgba(0,0,0,0.7), 0 0 80px rgba(56,189,248,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.6) 40%, rgba(14,165,233,0.8) 50%, rgba(56,189,248,0.6) 60%, transparent 100%)',
            backgroundSize: '200% 200%',
            animation: 'mrx-shimmer-border 3s ease infinite',
          }} />

          <div style={{ position: 'relative', padding: '2.25rem 2.25rem 2rem' }}>

            <div className="mrx-copy-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
              <div style={{ position: 'relative', width: 64, height: 64 }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(56,189,248,0.35)',
                  animation: 'mrx-pulse-ring 2.2s ease-out infinite',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  borderRadius: '50%',
                  border: '1.5px solid rgba(56,189,248,0.2)',
                  animation: 'mrx-pulse-ring 2.2s 0.6s ease-out infinite',
                }} />
                <div style={{
                  width: 64, height: 64, borderRadius: '16px',
                  background: step === 'password'
                    ? 'linear-gradient(145deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))'
                    : 'linear-gradient(145deg, rgba(14,165,233,0.12), rgba(56,189,248,0.06))',
                  border: step === 'password'
                    ? '1px solid rgba(245,158,11,0.25)'
                    : '1px solid rgba(56,189,248,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: step === 'password'
                    ? '0 0 24px rgba(245,158,11,0.1)'
                    : '0 0 24px rgba(56,189,248,0.1)',
                  position: 'relative', zIndex: 1,
                  transition: 'all 0.3s ease',
                }}>
                  {step === 'password' ? (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" stroke="#f59e0b" strokeWidth="1.8"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#f59e0b" strokeWidth="1.8"/>
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#38bdf8" strokeWidth="1.8"/>
                      <circle cx="12" cy="12" r="1" fill="rgba(56,189,248,0.6)"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            <div className="mrx-copy-1" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.62rem', fontWeight: 700, color: '#475569',
                letterSpacing: '0.16em', textTransform: 'uppercase',
              }}>
                Rangex Corp Private Limited
              </span>
            </div>

            <div className="mrx-copy-2" style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{
                fontSize: '1.45rem', fontWeight: 800, margin: 0,
                letterSpacing: '-0.03em', lineHeight: 1.25,
                background: step === 'password'
                  ? 'linear-gradient(135deg, #fef9c3 0%, #fde68a 50%, #fbbf24 100%)'
                  : 'linear-gradient(135deg, #f0f9ff 0%, #bae6fd 50%, #7dd3fc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 0.3s ease',
              }}>
                {step === 'password' ? 'Admin Access' : 'Welcome to MediRangeX\u2122'}
              </h2>
            </div>

            <div className="mrx-copy-3" style={{ textAlign: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
              <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.75, fontWeight: 400 }}>
                {step === 'password'
                  ? 'Enter your admin password to access the full platform with unrestricted access.'
                  : 'Clinical Intelligence AI Platform \u2014 an enterprise-grade decision support system crafted for modern health systems and clinical leaders.'}
              </p>
            </div>

            <div className="mrx-copy-4" style={{ marginBottom: '0.5rem' }}>
              {step === 'email' ? (
                <>
                  <label style={{
                    display: 'block', fontSize: '0.68rem', fontWeight: 700, color: '#334155',
                    letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.35rem', textAlign: 'center',
                  }}>
                    Exclusive Access
                  </label>
                  <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 0.85rem', lineHeight: 1.6, textAlign: 'center' }}>
                    Please enter your email to proceed. Your access will be logged for security purposes.
                  </p>
                  <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <input
                      className="mrx-input"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@organisation.com"
                      required
                      autoFocus
                      style={{
                        width: '100%', padding: '0.8rem 1rem',
                        background: 'rgba(6,10,18,0.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0.6rem', color: '#f0f4ff',
                        fontSize: '0.875rem', outline: 'none',
                        fontFamily: 'inherit', boxSizing: 'border-box',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        letterSpacing: '0.01em',
                      }}
                    />
                    {errorMsg && (
                      <div style={{
                        padding: '0.5rem 0.875rem',
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: '0.5rem', fontSize: '0.78rem', color: '#fca5a5',
                      }}>
                        {errorMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="mrx-proceed-btn"
                      style={{
                        width: '100%', padding: '0.875rem',
                        background: formState === 'submitting'
                          ? 'rgba(14,165,233,0.35)'
                          : 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #38bdf8 100%)',
                        border: 'none', borderRadius: '0.6rem', color: '#fff',
                        fontSize: '0.875rem', fontWeight: 700,
                        cursor: formState === 'submitting' ? 'wait' : 'pointer',
                        letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'inherit',
                      }}
                    >
                      {formState === 'submitting' ? 'Verifying...' : 'Enter Platform'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="mrx-step-in">
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <button type="button" className="mrx-back-btn" onClick={handleBackToEmail}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                      Back
                    </button>
                    <span style={{
                      marginLeft: 'auto', fontSize: '0.7rem', color: '#38bdf8',
                      fontWeight: 600, letterSpacing: '0.06em',
                    }}>
                      {email.trim()}
                    </span>
                  </div>
                  <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        className="mrx-input"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        required
                        autoFocus
                        style={{
                          width: '100%', padding: '0.8rem 2.75rem 0.8rem 1rem',
                          background: 'rgba(6,10,18,0.8)',
                          border: '1px solid rgba(245,158,11,0.2)',
                          borderRadius: '0.6rem', color: '#f0f4ff',
                          fontSize: '0.875rem', outline: 'none',
                          fontFamily: 'inherit', boxSizing: 'border-box',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          letterSpacing: '0.02em',
                        }}
                      />
                      <button
                        type="button"
                        className="mrx-pw-toggle"
                        style={{ position: 'absolute', right: 0, top: 0, bottom: 0 }}
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {errorMsg && (
                      <div style={{
                        padding: '0.5rem 0.875rem',
                        background: 'rgba(239,68,68,0.07)',
                        border: '1px solid rgba(239,68,68,0.18)',
                        borderRadius: '0.5rem', fontSize: '0.78rem', color: '#fca5a5',
                      }}>
                        {errorMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="mrx-proceed-btn"
                      style={{
                        width: '100%', padding: '0.875rem',
                        background: formState === 'submitting'
                          ? 'rgba(245,158,11,0.35)'
                          : 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
                        border: 'none', borderRadius: '0.6rem', color: '#fff',
                        fontSize: '0.875rem', fontWeight: 700,
                        cursor: formState === 'submitting' ? 'wait' : 'pointer',
                        letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'inherit',
                      }}
                    >
                      {formState === 'submitting' ? 'Authenticating...' : 'Access Platform'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', marginTop: '1.25rem',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(100,116,139,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <p style={{
                fontSize: '0.62rem', color: '#1e293b', margin: 0,
                lineHeight: 1.5, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {step === 'password'
                  ? 'Admin Access \u00b7 Full Permissions \u00b7 No Session Limit'
                  : 'Confidential \u00b7 Proprietary Technology \u00b7 \u00a9 2026 Rangex Corp'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
