import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import LandingPage from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import AdminPage from './pages/AdminPage';
import PlatformSpec from './pages/PlatformSpec';
import { AIGuideWidget } from './ai-guide';
import { EmailGateModal } from './components/visitor/EmailGateModal';
import { FeedbackModal } from './components/visitor/FeedbackModal';
import { ViewModeProvider, useViewMode } from './context/ViewModeContext';
import { ViewToggle } from './components/ui/ViewToggle';

const STORAGE_EMAIL_KEY = 'mrx_visitor_email';
const STORAGE_FEEDBACK_KEY = 'mrx_feedback_done';
const FEEDBACK_TRIGGER_DELAY_MS = 45_000;

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#05060a',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '4rem',
      paddingBottom: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 390,
        minHeight: '85vh',
        background: 'var(--bg-base)',
        borderRadius: '2.5rem',
        border: '2px solid rgba(245,158,11,0.25)',
        boxShadow: '0 0 0 6px rgba(245,158,11,0.04), 0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(245,158,11,0.06)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 80,
          height: 5,
          background: 'rgba(245,158,11,0.25)',
          borderRadius: 999,
          zIndex: 9999,
        }} />
        <div style={{ overflowY: 'auto', overflowX: 'hidden', maxHeight: '100%' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AppInner() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const { viewMode } = useViewMode();
  const isSimulatingMobile = viewMode === 'mobile';

  const [visitorEmail, setVisitorEmail] = useState<string | null>(
    () => localStorage.getItem(STORAGE_EMAIL_KEY)
  );
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailConfirmed = (email: string) => {
    localStorage.setItem(STORAGE_EMAIL_KEY, email);
    setVisitorEmail(email);
  };

  const handleFeedbackClose = () => {
    localStorage.setItem(STORAGE_FEEDBACK_KEY, '1');
    setShowFeedback(false);
  };

  useEffect(() => {
    if (isAdminRoute) return;

    const isOnDashboard =
      location.pathname === '/command-center' ||
      location.pathname === '/dashboard/command-center';
    const alreadySubmitted = localStorage.getItem(STORAGE_FEEDBACK_KEY) === '1';
    const hasEmail = !!visitorEmail;

    if (isOnDashboard && hasEmail && !alreadySubmitted) {
      feedbackTimerRef.current = setTimeout(() => {
        setShowFeedback(true);
      }, FEEDBACK_TRIGGER_DELAY_MS);
    } else {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    }

    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [location.pathname, visitorEmail, isAdminRoute]);

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  const appContent = (
    <>
      {!visitorEmail && <EmailGateModal onEmailConfirmed={handleEmailConfirmed} />}

      {visitorEmail && (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/platform-spec" element={<PlatformSpec />} />
          <Route path="/command-center" element={<CommandCenter />} />
          <Route path="/dashboard/command-center" element={<CommandCenter />} />
        </Routes>
      )}

      <AIGuideWidget />

      <FeedbackModal
        open={showFeedback}
        email={visitorEmail ?? ''}
        onClose={handleFeedbackClose}
      />
    </>
  );

  return (
    <>
      <ViewToggle />
      {isSimulatingMobile ? (
        <PhoneFrame>{appContent}</PhoneFrame>
      ) : (
        appContent
      )}
    </>
  );
}

export default function App() {
  return (
    <ViewModeProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ViewModeProvider>
  );
}
