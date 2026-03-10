export type GuideMode = 'clinical' | 'investor';
export type GuideStatus = 'idle' | 'speaking' | 'listening' | 'paused' | 'waiting';

export interface TourStep {
  id: string;
  title: string;
  script: string;
  targetSelector?: string;
  highlightColor?: string;
}

export interface QAEntry {
  patterns: (string | RegExp)[];
  answer: string;
}

export interface GuideState {
  mode: GuideMode;
  status: GuideStatus;
  currentStepIndex: number;
  isOpen: boolean;
  isTourActive: boolean;
  subtitleText: string;
  highlightTarget: string | null;
  highlightColor: string;
  qaAnswer: string | null;
  qaQuestion: string;
  isListening: boolean;
}
