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
  const modeRef = useRef<GuideMode>(mode);
  const isTourActiveRef = useRef(false);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);

  const ttsSupported = isTTSSupported();
  const sttSupported = isSTTSupported();

  useEffect(() => { modeRef.current = mode; }, [mode]);

  const stepsForMode = useCallback((m: GuideMode) => m === 'clinical' ? clinicalSteps : investorSteps, []);
  const steps = stepsForMode(mode);
  const totalSteps = steps.length;

  const clearHighlight = useCallback(() => {
    setHighlightTarget(null);
  }, []);

  const speakStep = useCallback((text: string, onDone?: () => void) => {
    if (!ttsSupported) {
      setSubtitleText(text);
      setTimeout(() => {
        setSubtitleText('');
        onDone?.();
      }, 100);
      return;
    }

    setSubtitleText(text);
    setStatus('speaking');

    speak(text, {
      profile: modeRef.current,
      onEnd: () => {
        if (isCancelledRef.current) return;
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
  }, [ttsSupported, clearHighlight]);

  const runTourFromStep = useCallback((stepIndex: number, stepsArr: typeof clinicalSteps, currentMode: GuideMode) => {
    if (isCancelledRef.current) return;

    if (stepIndex >= stepsArr.length) {
      isTourActiveRef.current = false;
      setIsTourActive(false);
      setCurrentStepIndex(0);
      setHighlightTarget(null);

      const outro = currentMode === 'clinical'
        ? "That completes the clinical walkthrough. You can ask me any question about the platform, or start the tour again at any time."
        : "That concludes the investor overview. I'm happy to answer any questions about the platform, the business model, or the technology.";

      speakStep(outro);
      return;
    }

    const step = stepsArr[stepIndex];
    setCurrentStepIndex(stepIndex);
    setHighlightTarget(step.targetSelector ?? null);
    setHighlightColor(step.highlightColor ?? '#38bdf8');

    speakStep(step.script, () => {
      if (isCancelledRef.current || isPausedRef.current) return;
      runTourFromStep(stepIndex + 1, stepsArr, currentMode);
    });
  }, [speakStep]);

  const showIdlePrompt = useCallback(() => {
    if (isTourActiveRef.current) return;
    const prompt = modeRef.current === 'clinical'
      ? "I'm here to help. Would you like a guided tour of the clinical intelligence engine, or do you have a specific question?"
      : "Ready when you are. Would you like to walk through the investor overview, or ask about a specific aspect of the platform?";
    speakStep(prompt);
  }, [speakStep]);

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
    isCancelledRef.current = false;
    isPausedRef.current = false;
    isTourActiveRef.current = true;

    setIsTourActive(true);
    setCurrentStepIndex(0);
    setQaAnswer(null);
    setIsPaused(false);
    setHighlightTarget(null);

    const currentMode = modeRef.current;
    const currentSteps = stepsForMode(currentMode);

    const greeting = currentMode === 'clinical'
      ? "Welcome. I'm ARIA — your Adaptive Real-time Intelligence Assistant. Allow me to guide you through MediRangeX, a real-time clinical intelligence platform designed to surface critical decisions exactly when care teams need them. Let's begin."
      : "Welcome, and thank you for joining us. I'm ARIA — your Adaptive Real-time Intelligence Assistant. I'll be walking you through MediRangeX — a platform redefining clinical intelligence at enterprise scale. Let's get started.";

    speakStep(greeting, () => {
      if (isCancelledRef.current) return;
      runTourFromStep(0, currentSteps, currentMode);
    });
  }, [stepsForMode, speakStep, runTourFromStep]);

  const pauseTour = useCallback(() => {
    if (status === 'speaking') {
      pauseSpeaking();
      isPausedRef.current = true;
      setStatus('paused');
      setIsPaused(true);
    }
  }, [status]);

  const resumeTour = useCallback(() => {
    if (isPausedRef.current) {
      resumeSpeaking();
      isPausedRef.current = false;
      setStatus('speaking');
      setIsPaused(false);
    }
  }, []);

  const restartTour = useCallback(() => {
    isCancelledRef.current = true;
    stopSpeaking();
    setIsTourActive(false);
    setCurrentStepIndex(0);
    setHighlightTarget(null);
    setQaAnswer(null);
    setIsPaused(false);
    isPausedRef.current = false;
    isTourActiveRef.current = false;
    setTimeout(() => {
      isCancelledRef.current = false;
      startTour();
    }, 150);
  }, [startTour]);

  const stopTour = useCallback(() => {
    isCancelledRef.current = true;
    isPausedRef.current = false;
    isTourActiveRef.current = false;
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

    isCancelledRef.current = true;
    stopSpeaking();
    isTourActiveRef.current = false;
    setIsTourActive(false);
    setHighlightTarget(null);
    setQaAnswer(null);

    const qa = modeRef.current === 'clinical' ? clinicalQA : investorQA;
    const answer = findAnswer(question, qa);

    const response = answer
      ?? (modeRef.current === 'clinical'
        ? "That's a great clinical question. The platform is continuously updated to address these scenarios. I'd recommend exploring the specific panel for more detail, or consulting the system documentation for technical specifications."
        : "That's an important strategic question. The platform is designed to address exactly these considerations at enterprise scale. I'd recommend scheduling a detailed technical discussion with the team for a full answer.");

    setQaAnswer(response);
    isCancelledRef.current = false;
    speakStep(response);
  }, [resetIdleTimer, speakStep]);

  const startVoiceInput = useCallback(() => {
    if (!sttSupported || isListening) return;
    isCancelledRef.current = true;
    stopSpeaking();
    setIsListening(true);
    setStatus('listening');

    startListening(
      (transcript) => {
        setQaQuestion(transcript);
        setIsListening(false);
        setStatus('idle');
        isCancelledRef.current = false;
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
    if (newMode === modeRef.current) return;
    isCancelledRef.current = true;
    isPausedRef.current = false;
    isTourActiveRef.current = false;
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
    setTimeout(() => { isCancelledRef.current = false; }, 50);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        resetIdleTimer();
      } else {
        isCancelledRef.current = true;
        isPausedRef.current = false;
        isTourActiveRef.current = false;
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
