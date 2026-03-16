import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onRequestAccess?: () => void;
}

export default function Navbar({ onRequestAccess }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navLinks = [
    { label: 'Platform', target: 'capabilities' },
    { label: 'Demo', target: 'sepsis-demo' },
    { label: 'Architecture', target: 'architecture' },
    { label: 'API', target: 'api-surface' },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: 'all 0.3s ease',
          background: scrolled || menuOpen
            ? 'rgba(5, 8, 16, 0.96)'
            : 'transparent',
          backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
          borderBottom: scrolled || menuOpen ? '1px solid rgba(56,189,248,0.08)' : '1px solid transparent',
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              onClick={goHome}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56,189,248,0.4)',
                flexShrink: 0,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f4ff' }}>
                Medi<span style={{ color: '#38bdf8' }}>RangeX</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
              {navLinks.map(({ label, target }) => (
                <button
                  key={target}
                  onClick={() => scrollTo(target)}
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => navigate('/platform-spec')}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Spec
              </button>
              <button
                onClick={() => navigate('/dashboard/command-center')}
                className="nav-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Dashboard
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="hidden-mobile">
                <div className="status-dot" />
                <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>Live</span>
              </div>
              <button
                className="btn-demo hidden-mobile"
                style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem' }}
                onClick={() => scrollTo('clinical-demo')}
              >
                <span style={{ marginRight: '0.3rem' }}>▶</span>
                Live Demo
              </button>
              <button
                className="btn-primary hidden-mobile"
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                onClick={onRequestAccess}
              >
                Request Access
              </button>

              <button
                className="show-mobile"
                onClick={() => setMenuOpen(o => !o)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {menuOpen ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div style={{
            borderTop: '1px solid rgba(56,189,248,0.08)',
            background: 'rgba(5,8,16,0.98)',
            padding: '1rem 1.25rem 1.5rem',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {navLinks.map(({ label, target }) => (
                <button
                  key={target}
                  onClick={() => scrollTo(target)}
                  style={{
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    padding: '0.875rem 0',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => { setMenuOpen(false); navigate('/platform-spec'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  padding: '0.875rem 0',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                Spec
              </button>
              <button
                onClick={() => { setMenuOpen(false); navigate('/dashboard/command-center'); }}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  padding: '0.875rem 0',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                Dashboard
              </button>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  className="btn-demo"
                  style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem' }}
                  onClick={() => scrollTo('clinical-demo')}
                >
                  <span style={{ marginRight: '0.3rem' }}>▶</span>Live Demo
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, padding: '0.65rem', fontSize: '0.82rem' }}
                  onClick={() => { setMenuOpen(false); onRequestAccess?.(); }}
                >
                  Request Access
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
