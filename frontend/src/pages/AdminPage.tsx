import { useState } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

interface Visitor {
  email: string;
  access_count: number;
  first_visit: string;
  last_visit: string;
  user_agent: string;
}

interface FeedbackEntry {
  email: string;
  rating: number;
  comment: string;
  submitted_at: string;
}

interface AdminData {
  visitors: Visitor[];
  feedback: FeedbackEntry[];
}

type LoginState = 'idle' | 'loading' | 'error';
type Tab = 'visitors' | 'feedback';

const STAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= rating ? STAR_COLORS[rating - 1] : 'none'}
          stroke={s <= rating ? STAR_COLORS[rating - 1] : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: '0.75rem', color: STAR_COLORS[rating - 1], fontWeight: 700, marginLeft: '4px' }}>
        {rating}/5
      </span>
    </div>
  );
}

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [loginError, setLoginError] = useState('');
  const [data, setData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('visitors');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState('loading');
    setLoginError('');
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setLoginState('error');
        setLoginError(json.error || 'Invalid credentials');
        return;
      }
      setData(json);
      setLoginState('idle');
    } catch {
      setLoginState('error');
      setLoginError('Network error. Please try again.');
    }
  };

  const avgRating = data?.feedback.length
    ? (data.feedback.reduce((sum, f) => sum + f.rating, 0) / data.feedback.length).toFixed(1)
    : null;
  const isMobile = useIsMobile();

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem 0.875rem',
    background: 'rgba(8,12,20,0.9)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#f0f4ff',
    fontSize: '0.875rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  if (!data) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#060a11',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '380px',
          background: '#0d1219',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            padding: '1.5rem 1.75rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            background: '#0a0e17',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.25rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '8px',
                background: 'rgba(56,189,248,0.1)',
                border: '1px solid rgba(56,189,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f0f4ff' }}>
                Admin Access
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#475569', paddingLeft: '42px' }}>
              MediRangeX — Restricted Area
            </div>
          </div>

          <div style={{ padding: '1.5rem 1.75rem' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.7rem', fontWeight: 600,
                  color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem',
                }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block', fontSize: '0.7rem', fontWeight: 600,
                  color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.4rem',
                }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                />
              </div>

              {loginError && (
                <div style={{
                  padding: '0.5rem 0.75rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '0.4rem',
                  fontSize: '0.8rem', color: '#ef4444',
                }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginState === 'loading'}
                style={{
                  width: '100%', padding: '0.75rem',
                  background: loginState === 'loading'
                    ? 'rgba(56,189,248,0.4)'
                    : 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                  border: 'none', borderRadius: '0.5rem',
                  color: '#fff', fontSize: '0.875rem', fontWeight: 700,
                  cursor: loginState === 'loading' ? 'wait' : 'pointer',
                  fontFamily: 'inherit', transition: 'opacity 0.2s',
                }}
              >
                {loginState === 'loading' ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060a11',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f0f4ff',
    }}>
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0a0e17',
        padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '56px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '6px',
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f4ff' }}>MediRangeX Admin</span>
          <span style={{
            padding: '2px 8px', borderRadius: '4px',
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
            fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.04em',
          }}>RESTRICTED</span>
        </div>
        <button
          onClick={() => setData(null)}
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px', padding: '5px 12px', cursor: 'pointer',
            color: '#64748b', fontSize: '0.75rem', fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#64748b'; }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ padding: isMobile ? '1rem' : '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
          {[
            {
              label: 'Total Visitors',
              value: data.visitors.length,
              sub: 'unique emails',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              ),
              color: '#38bdf8',
            },
            {
              label: 'Total Accesses',
              value: data.visitors.reduce((s, v) => s + v.access_count, 0),
              sub: 'across all visitors',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              ),
              color: '#10b981',
            },
            {
              label: 'Avg. Rating',
              value: avgRating ? `${avgRating} / 5` : '—',
              sub: `${data.feedback.length} feedback responses`,
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ),
              color: '#f59e0b',
            },
          ].map(card => (
            <div key={card.label} style={{
              background: '#0d1219', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px', padding: '1.25rem 1.5rem',
              display: 'flex', alignItems: 'flex-start', gap: '12px',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: '8px', flexShrink: 0,
                background: `rgba(${card.color === '#38bdf8' ? '56,189,248' : card.color === '#10b981' ? '16,185,129' : '245,158,11'},0.1)`,
                border: `1px solid rgba(${card.color === '#38bdf8' ? '56,189,248' : card.color === '#10b981' ? '16,185,129' : '245,158,11'},0.2)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#475569', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f4ff', lineHeight: 1.2, marginTop: '2px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#334155', marginTop: '2px' }}>
                  {card.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['visitors', 'feedback'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === tab ? '#38bdf8' : '#475569',
                fontSize: '0.85rem', fontWeight: activeTab === tab ? 700 : 400,
                cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize', letterSpacing: '0.02em',
                marginBottom: '-1px', transition: 'color 0.15s',
              }}
            >
              {tab === 'visitors' ? `Visitors (${data.visitors.length})` : `Feedback (${data.feedback.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'visitors' && (
          <div style={{
            background: '#0d1219', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: isMobile ? '520px' : undefined, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#0a0e17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Email', 'Access Count', 'First Visit', 'Last Visit'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      fontSize: '0.68rem', fontWeight: 700, color: '#475569',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.visitors.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                      No visitors yet
                    </td>
                  </tr>
                ) : data.visitors.map((v, i) => (
                  <tr key={v.email} style={{
                    borderBottom: i < data.visitors.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {v.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        padding: '3px 10px', borderRadius: '20px',
                        background: v.access_count > 1 ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${v.access_count > 1 ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: v.access_count > 1 ? '#38bdf8' : '#94a3b8',
                        fontWeight: 700, fontSize: '0.8rem',
                      }}>
                        {v.access_count}x
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                      {formatDate(v.first_visit)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.78rem' }}>
                      {formatDate(v.last_visit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div style={{
            background: '#0d1219', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px', overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: isMobile ? '540px' : undefined, borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#0a0e17', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Email', 'Rating', 'Comment', 'Submitted'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem 1rem', textAlign: 'left',
                      fontSize: '0.68rem', fontWeight: 700, color: '#475569',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.feedback.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#334155', fontSize: '0.82rem' }}>
                      No feedback yet
                    </td>
                  </tr>
                ) : data.feedback.map((f, i) => (
                  <tr key={i} style={{
                    borderBottom: i < data.feedback.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    transition: 'background 0.1s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = ''; }}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontWeight: 500 }}>
                      {f.email}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <StarRating rating={f.rating} />
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', maxWidth: '320px' }}>
                      {f.comment || <span style={{ color: '#334155', fontStyle: 'italic' }}>No comment</span>}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      {formatDate(f.submitted_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
