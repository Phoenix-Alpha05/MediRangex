import { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  open: boolean;
  email: string;
  onClose: () => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

export function FeedbackModal({ open, email, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!open) return null;

  const displayed = hovered || rating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setFormState('submitting');
    setErrorMsg('');

    try {
      await supabase.from('feedback').insert({
        email,
        rating,
        comment: comment.trim(),
      });
      setFormState('success');
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
        zIndex: 99990,
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
          backdropFilter: 'blur(4px)',
          animation: 'overlayFadeIn 0.2s ease',
        }}
      />
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          background: '#0d1219',
          border: '1px solid rgba(56,189,248,0.14)',
          borderRadius: '16px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 50px rgba(56,189,248,0.05)',
          overflow: 'hidden',
          animation: 'modalScaleIn 0.22s ease',
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
              How was your experience?
            </div>
            <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.15rem' }}>
              Your feedback helps us improve MediRangeX
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

        <div style={{ padding: '1.75rem 1.5rem' }}>
          {formState === 'success' ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.5rem' }}>
                Thank you for your feedback!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We appreciate you taking the time to share your experience with us.
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: '0.6rem 1.75rem',
                  background: 'rgba(56,189,248,0.1)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  borderRadius: '0.5rem',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(56,189,248,0.1)'; }}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}>
                  Rate your experience
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        transition: 'transform 0.1s ease',
                        transform: star <= displayed ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill={star <= displayed ? '#f59e0b' : 'none'}
                        stroke={star <= displayed ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transition: 'fill 0.15s, stroke 0.15s' }}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  ))}
                </div>

                {displayed > 0 && (
                  <div style={{
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#f59e0b',
                    letterSpacing: '0.02em',
                    minHeight: '20px',
                  }}>
                    {RATING_LABELS[displayed]}
                  </div>
                )}
              </div>

              <div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#94a3b8',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}>
                  Feedback <span style={{ color: '#334155', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                </div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share what you liked or how we can improve..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.875rem',
                    background: 'rgba(8,12,20,0.8)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    color: '#f0f4ff',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
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
                disabled={formState === 'submitting' || rating === 0}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: rating === 0
                    ? 'rgba(56,189,248,0.15)'
                    : formState === 'submitting'
                    ? 'rgba(56,189,248,0.4)'
                    : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: rating === 0 ? '#475569' : '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: rating === 0 || formState === 'submitting' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'opacity 0.2s',
                }}
              >
                {formState === 'submitting' ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
