import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import LandingPage from './pages/LandingPage';
import { CommandCenter } from './pages/CommandCenter';
import AdminPage from './pages/AdminPage';
import { AIGuideWidget } from './ai-guide';
import { EmailGateModal } from './components/visitor/EmailGateModal';
import { FeedbackModal } from './components/visitor/FeedbackModal';

const STORAGE_EMAIL_KEY = 'mrx_visitor_email';
const STORAGE_FEEDBACK_KEY = 'mrx_feedback_done';
const FEEDBACK_TRIGGER_DELAY_MS = 45_000;

function AppInner() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

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

  return (
    <>
      {!visitorEmail && <EmailGateModal onEmailConfirmed={handleEmailConfirmed} />}

      {visitorEmail && (
        <Routes>
          <Route path="/" element={<LandingPage />} />
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
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
