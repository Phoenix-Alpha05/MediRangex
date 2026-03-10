import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onRequestAccess?: () => void;
}

export default function Navbar({ onRequestAccess }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const goHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled
          ? 'rgba(5, 8, 16, 0.9)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(56,189,248,0.08)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
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
            {[
              { label: 'Platform', target: 'capabilities' },
              { label: 'Demo', target: 'sepsis-demo' },
              { label: 'Architecture', target: 'architecture' },
              { label: 'API', target: 'api-surface' },
            ].map(({ label, target }) => (
              <button
                key={target}
                onClick={() => scrollTo(target)}
                className="nav-link"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => navigate('/dashboard/command-center')}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Dashboard
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className="status-dot" />
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 500 }}>Live</span>
            </div>
            <button
              className="btn-demo"
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.78rem' }}
              onClick={() => scrollTo('clinical-demo')}
            >
              <span style={{ marginRight: '0.3rem' }}>▶</span>
              Live Demo
            </button>
            <button
              className="btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
              onClick={onRequestAccess}
            >
              Request Access
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
