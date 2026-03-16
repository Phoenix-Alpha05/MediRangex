import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import SpecSidebar from '../components/spec/SpecSidebar';
import SpecSectionBlock from '../components/spec/SpecSectionBlock';
import { SPEC_SECTIONS, TOC_SECTIONS } from '../components/spec/specData';

export default function PlatformSpec() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState('section-1');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const targets = TOC_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveSection(topmost.target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    targets.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const handleNavigate = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(10,14,23,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(56,189,248,0.08)',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
      }}>
        <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: 0,
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(56,189,248,0.3)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#f0f4ff' }}>
                Medi<span style={{ color: '#38bdf8' }}>RangeX</span>
              </span>
            </button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em' }}>
              PLATFORM SPECIFICATION
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {!isMobile && <span style={{
              padding: '0.3rem 0.7rem',
              background: 'rgba(56,189,248,0.08)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: 4,
              fontSize: '0.65rem',
              color: '#38bdf8',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              v2.4.1 — Enterprise
            </span>}
            <button
              onClick={() => navigate('/command-center')}
              style={{
                padding: '0.4rem 0.875rem',
                background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                border: 'none',
                borderRadius: 6,
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                whiteSpace: 'nowrap',
              }}
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <div style={{ paddingTop: 64 }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: isMobile ? '0 1rem' : '0 1.5rem',
          display: 'flex',
          gap: '3rem',
          paddingTop: '2rem',
          paddingBottom: '4rem',
          alignItems: 'flex-start',
        }}>
          {!isMobile && <SpecSidebar activeSection={activeSection} onNavigate={handleNavigate} />}

          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.3rem 0.75rem',
                background: 'rgba(56,189,248,0.06)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 20,
                marginBottom: '1.25rem',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                <span style={{ fontSize: '0.68rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Clinical AI Platform
                </span>
              </div>
              <h1 style={{
                margin: '0 0 0.75rem 0',
                fontSize: '2.5rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                color: '#f0f4ff',
              }}>
                MediRangeX<br />
                <span style={{ color: '#38bdf8' }}>Platform Specification</span>
              </h1>
              <p style={{
                margin: '0 0 1.5rem 0',
                fontSize: '0.92rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                maxWidth: '60ch',
              }}>
                Enterprise architecture and capability document. Intended for clinical leadership, hospital CIOs, health system administrators, AI/ML engineering teams, and digital health investors.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                  { label: '14 Capability Domains' },
                  { label: '7-Layer Architecture' },
                  { label: 'HIPAA · SOC 2' },
                  { label: 'FHIR R4 Native' },
                ].map((badge) => (
                  <span key={badge.label} style={{
                    padding: '0.3rem 0.75rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}>
                    {badge.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: '3rem' }} />

            {SPEC_SECTIONS.map((section) => (
              <SpecSectionBlock key={section.id} section={section} />
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
