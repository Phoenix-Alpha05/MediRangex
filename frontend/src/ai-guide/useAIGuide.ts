import { useCallback, useEffect, useRef, useState } from 'react';
import type { GuideMode, GuideStatus } from './types';
import { clinicalSteps, investorSteps } from './tourSteps';
import { clinicalQA, investorQA, findAnswer } from './knowledgeBase';
import { speak, stopSpeaking, pauseSpeaking, resumeSpeaking, startListening, stopListening, isTTSSupported, isSTTSupported } from './voiceEngine';

const IDLE_PROMPT_DELAY = 45000;

export function useAIGuide() {
  const [mode, setMode] = useState<GuideMode>('clinical');
  const [status, setStatus] = useState<GuideStatus>('idle');
  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [subtitleText, setSubtitleText] = useState('');
  const [highlightTarget, setHighlightTarget] = useState<string | null>(null);
  const [highlightColor, setHighlightColor] = useState('#38bdf8');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaQuestion, setQaQuestion] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ttsSupported = isTTSSupported();
  const sttSupported = isSTTSupported();

  const steps = mode === 'clinical' ? clinicalSteps : investorSteps;
  const totalSteps = steps.length;

  const clearHighlight = useCallback(() => {
    setHighlightTarget(null);
  }, []);

  const speakText = useCallback((text: string, onDone?: () => void) => {
    if (!ttsSupported) {
      setSubtitleText(text);
      onDone?.();
      return;
    }

    setSubtitleText(text);
    setStatus('speaking');

    speak(text, {
      profile: mode,
      onWord: (word) => {
        setSubtitleText(prev => {
          const idx = text.indexOf(word, Math.max(0, text.length - prev.length - 10));
          if (idx !== -1) {
            return text.slice(Math.max(0, idx - 60), idx + word.length + 60).trim();
          }
          return prev;
        });
      },
      onEnd: () => {
        setStatus('idle');
        setSubtitleText('');
        clearHighlight();
        onDone?.();
      },
      onError: () => {
        setStatus('idle');
        setSubtitleText('');
        clearHighlight();
        onDone?.();
      },
    });
  }, [mode, ttsSupported, clearHighlight]);

  const showIdlePrompt = useCallback(() => {
    if (status !== 'idle' || isTourActive) return;
    const prompt = mode === 'clinical'
      ? "I'm here to help. Would you like a guided tour of the clinical intelligence engine, or do you have a specific question?"
      : "Ready when you are. Would you like to walk through the investor overview, or ask about a specific aspect of the platform?";
    speakText(prompt);
  }, [status, isTourActive, mode, speakText]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(showIdlePrompt, IDLE_PROMPT_DELAY);
  }, [showIdlePrompt]);

  useEffect(() => {
    if (isOpen) resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isOpen, resetIdleTimer]);

  const startTour = useCallback(() => {
    stopSpeaking();
    setIsTourActive(true);
    setCurrentStepIndex(0);
    setQaAnswer(null);
    setIsPaused(false);

    const step = steps[0];
    setHighlightTarget(null);
    setHighlightColor(step.highlightColor ?? '#38bdf8');

    const greeting = mode === 'clinical'
      ? "Welcome. It's truly wonderful to have you here. I'm your AI clinical intelligence guide, and I must say — you've arrived at quite the right moment. Allow me to take you through MediRangeX, one of the most sophisticated real-time clinical intelligence platforms ever assembled. Shall we begin?"
      : "Welcome, and thank you so very much for joining us today. It's a genuine pleasure to have you here. I'll be guiding you through MediRangeX — a platform that is quietly redefining what clinical intelligence looks like at enterprise scale. I think you'll find this rather illuminating.";

    speakText(greeting, () => {
      setHighlightTarget(step.targetSelector ?? null);
      speakText(step.script, () => {
        setCurrentStepIndex(1);
      });
    });
  }, [mode, steps, speakText]);

  const advanceStep = useCallback((index: number) => {
    if (index >= totalSteps) {
      setIsTourActive(false);
      setCurrentStepIndex(0);
      setHighlightTarget(null);
      const outro = mode === 'clinical'
        ? "That completes the clinical walkthrough. You can ask me any question about the platform, or start the tour again at any time."
        : "That concludes the investor overview. I'm happy to answer any questions about the platform, the business model, or the technology.";
      speakText(outro);
      return;
    }

    const step = steps[index];
    setHighlightTarget(step.targetSelector ?? null);
    setHighlightColor(step.highlightColor ?? '#38bdf8');

    speakText(step.script, () => {
      setCurrentStepIndex(index + 1);
    });
  }, [steps, totalSteps, mode, speakText]);

  useEffect(() => {
    if (!isTourActive || isPaused) return;
    if (currentStepIndex === 0) return;
    advanceStep(currentStepIndex);
  }, [currentStepIndex, isTourActive, isPaused, advanceStep]);

  const pauseTour = useCallback(() => {
    if (status === 'speaking') {
      pauseSpeaking();
      setStatus('paused');
      setIsPaused(true);
    }
  }, [status]);

  const resumeTour = useCallback(() => {
    if (isPaused) {
      resumeSpeaking();
      setStatus('speaking');
      setIsPaused(false);
    }
  }, [isPaused]);

  const restartTour = useCallback(() => {
    stopSpeaking();
    setIsTourActive(false);
    setCurrentStepIndex(0);
    setHighlightTarget(null);
    setQaAnswer(null);
    setIsPaused(false);
    setTimeout(() => startTour(), 100);
  }, [startTour]);

  const stopTour = useCallback(() => {
    stopSpeaking();
    setIsTourActive(false);
    setCurrentStepIndex(0);
    setHighlightTarget(null);
    setSubtitleText('');
    setStatus('idle');
    setIsPaused(false);
  }, []);

  const askQuestion = useCallback((question: string) => {
    if (!question.trim()) return;
    resetIdleTimer();

    stopSpeaking();
    setIsTourActive(false);
    setHighlightTarget(null);
    setQaAnswer(null);

    const qa = mode === 'clinical' ? clinicalQA : investorQA;
    const answer = findAnswer(question, qa);

    const response = answer
      ?? (mode === 'clinical'
        ? "That's a great clinical question. The platform is continuously updated to address these scenarios. I'd recommend exploring the specific panel for more detail, or consult the system documentation for deep technical specifications."
        : "That's an important strategic question. The platform is designed to address exactly these considerations at enterprise scale. I'd recommend scheduling a detailed technical discussion with the team for a full answer.");

    setQaAnswer(response);
    speakText(response);
  }, [mode, resetIdleTimer, speakText]);

  const startVoiceInput = useCallback(() => {
    if (!sttSupported || isListening) return;
    stopSpeaking();
    setIsListening(true);
    setStatus('listening');

    startListening(
      (transcript) => {
        setQaQuestion(transcript);
        setIsListening(false);
        setStatus('idle');
        askQuestion(transcript);
      },
      () => {
        setIsListening(false);
        setStatus('idle');
      },
    );
  }, [sttSupported, isListening, askQuestion]);

  const stopVoiceInput = useCallback(() => {
    stopListening();
    setIsListening(false);
    setStatus('idle');
  }, []);

  const switchMode = useCallback((newMode: GuideMode) => {
    if (newMode === mode) return;
    stopSpeaking();
    setMode(newMode);
    setIsTourActive(false);
    setCurrentStepIndex(0);
    setHighlightTarget(null);
    setQaAnswer(null);
    setQaQuestion('');
    setSubtitleText('');
    setStatus('idle');
    setIsPaused(false);
  }, [mode]);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) resetIdleTimer();
      else {
        stopSpeaking();
        setIsTourActive(false);
        setHighlightTarget(null);
        setSubtitleText('');
        setStatus('idle');
      }
      return !prev;
    });
  }, [resetIdleTimer]);

  const accentColor = mode === 'clinical' ? '#38bdf8' : '#f59e0b';

  return {
    mode,
    status,
    isOpen,
    isTourActive,
    currentStepIndex,
    totalSteps,
    subtitleText,
    highlightTarget,
    highlightColor,
    qaAnswer,
    qaQuestion,
    setQaQuestion,
    isListening,
    isPaused,
    accentColor,
    ttsSupported,
    sttSupported,
    steps,
    toggleOpen,
    switchMode,
    startTour,
    pauseTour,
    resumeTour,
    restartTour,
    stopTour,
    askQuestion,
    startVoiceInput,
    stopVoiceInput,
  };
}
