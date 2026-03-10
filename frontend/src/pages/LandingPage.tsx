import { useCallback, useState } from 'react';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import CapabilitiesSection from '../components/landing/CapabilitiesSection';
import IntelligenceSection from '../components/landing/IntelligenceSection';
import ClinicalDemoSection from '../components/landing/ClinicalDemoSection';
import ArchitectureSection from '../components/landing/ArchitectureSection';
import MetricsSection from '../components/landing/MetricsSection';
import CTASection from '../components/landing/CTASection';
import ResourcesSection from '../components/landing/ResourcesSection';
import Footer from '../components/landing/Footer';
import RequestAccessModal from '../components/landing/RequestAccessModal';

export default function LandingPage() {
  const [showAccessModal, setShowAccessModal] = useState(false);

  const openAccessModal = useCallback(() => setShowAccessModal(true), []);
  const closeAccessModal = useCallback(() => setShowAccessModal(false), []);

  return (
    <div style={{ background: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar onRequestAccess={openAccessModal} />
      <HeroSection />
      <div className="section-divider" />
      <CapabilitiesSection />
      <div className="section-divider" />
      <IntelligenceSection />
      <div className="section-divider" />
      <ClinicalDemoSection />
      <div className="section-divider" />
      <ArchitectureSection />
      <div className="section-divider" />
      <MetricsSection />
      <div className="section-divider" />
      <ResourcesSection />
      <div className="section-divider" />
      <CTASection onRequestAccess={openAccessModal} />
      <Footer />
      <RequestAccessModal open={showAccessModal} onClose={closeAccessModal} />
    </div>
  );
}
