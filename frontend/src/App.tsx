import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import LandingPage from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import AdminPage from './pages/AdminPage';
import PlatformSpec from './pages/PlatformSpec';
import { AIGuideWidget } from './ai-guide';
import { EmailGateModal } from './components/visitor/EmailGateModal';
import { FeedbackModal } from './components/visitor/FeedbackModal';
import { SessionBanner } from './components/visitor/SessionBanner';
import { ViewModeProvider, useViewMode } from './context/ViewModeContext';
import { ViewToggle } from './components/ui/ViewToggle';

const STORAGE_EMAIL_KEY = 'mrx_visitor_email';
const STORAGE_FEEDBACK_KEY = 'mrx_feedback_done';
const STORAGE_EXPIRY_KEY = 'mrx_session_expiry';
const STORAGE_IS_ADMIN_KEY = 'mrx_is_admin';
const FEEDBACK_TRIGGER_DELAY_MS = 45_000;
const SESSION_DURATION_MS = 15 * 60 * 1000;

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

function readStoredSession(): { email: string | null; isAdmin: boolean; expiresAt: number | null } {
  const email = localStorage.getItem(STORAGE_EMAIL_KEY);
  const isAdmin = localStorage.getItem(STORAGE_IS_ADMIN_KEY) === 'true';
  const expiryRaw = localStorage.getItem(STORAGE_EXPIRY_KEY);
  const expiresAt = expiryRaw ? parseInt(expiryRaw, 10) : null;
  return { email, isAdmin, expiresAt };
}

function clearSession() {
  localStorage.removeItem(STORAGE_EMAIL_KEY);
  localStorage.removeItem(STORAGE_IS_ADMIN_KEY);
  localStorage.removeItem(STORAGE_EXPIRY_KEY);
  localStorage.removeItem(STORAGE_FEEDBACK_KEY);
}

function AppInner() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';
  const { viewMode } = useViewMode();
  const isSimulatingMobile = viewMode === 'mobile';

  const initSession = () => {
    const { email, isAdmin, expiresAt } = readStoredSession();
    if (!email) return { email: null, isAdmin: false, expiresAt: null };
    if (!isAdmin && (expiresAt === null || Date.now() >= expiresAt)) {
      clearSession();
      return { email: null, isAdmin: false, expiresAt: null };
    }
    return { email, isAdmin, expiresAt };
  };

  const [session, setSession] = useState(initSession);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback(() => {
    clearSession();
    setShowFeedback(false);
    setSession({ email: null, isAdmin: false, expiresAt: null });
  }, []);

  const handleLoginSuccess = useCallback((email: string, isAdmin: boolean) => {
    if (isAdmin) {
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      localStorage.setItem(STORAGE_IS_ADMIN_KEY, 'true');
      localStorage.removeItem(STORAGE_EXPIRY_KEY);
      setSession({ email, isAdmin: true, expiresAt: null });
    } else {
      const expiresAt = Date.now() + SESSION_DURATION_MS;
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      localStorage.setItem(STORAGE_IS_ADMIN_KEY, 'false');
      localStorage.setItem(STORAGE_EXPIRY_KEY, String(expiresAt));
      setSession({ email, isAdmin: false, expiresAt });
    }
  }, []);

  useEffect(() => {
    if (session.isAdmin || !session.email || session.expiresAt === null) return;

    const checkExpiry = () => {
      if (Date.now() >= session.expiresAt!) {
        handleLogout();
      }
    };

    const id = setInterval(checkExpiry, 5000);
    return () => clearInterval(id);
  }, [session.email, session.isAdmin, session.expiresAt, handleLogout]);

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
    const hasEmail = !!session.email;

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
  }, [location.pathname, session.email, isAdminRoute]);

  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  const showSessionBanner =
    !!session.email && !session.isAdmin && session.expiresAt !== null;

  const appContent = (
    <>
      {showSessionBanner && (
        <SessionBanner expiresAt={session.expiresAt!} onExpired={handleLogout} />
      )}

      {!session.email && (
        <EmailGateModal onLoginSuccess={handleLoginSuccess} />
      )}

      {session.email && (
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
        email={session.email ?? ''}
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
