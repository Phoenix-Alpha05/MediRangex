export type VoiceProfile = 'clinical' | 'investor';

interface SpeakOptions {
  profile: VoiceProfile;
  onWord?: (word: string, charIndex: number) => void;
  onEnd?: () => void;
  onError?: () => void;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface WindowWithSR {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
}

let recognition: SpeechRecognitionLike | null = null;
let activeSessionId = 0;
let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

function startKeepAlive(): void {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }
  }, 10000);
}

function stopKeepAlive(): void {
  if (keepAliveTimer !== null) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

function preprocessForSpeech(text: string): string {
  return text.replace(/(\d+)\.(\d+)/g, (_, whole, frac) => `${whole} point ${frac}`);
}

function splitIntoChunks(text: string): string[] {
  const processed = preprocessForSpeech(text);
  const raw = processed.match(/[^.!?]+(?:[.!?]+(?:\s|$))?/g) ?? [processed];
  return raw.map(s => s.trim()).filter(s => s.length > 0);
}

function pickVoice(_profile: VoiceProfile): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = [
    'Google UK English Female',
    'Microsoft Hazel Desktop',
    'Microsoft Hazel',
    'Serena',
    'Martha',
    'Karen',
    'Moira',
    'Samantha',
    'Victoria',
    'Google US English',
    'Microsoft Zira',
    'Microsoft Zira Desktop',
  ];

  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }

  const ukFemale = voices.find(v => v.lang === 'en-GB' && /female|f\b/i.test(v.name));
  if (ukFemale) return ukFemale;

  const ukAny = voices.find(v => v.lang === 'en-GB');
  if (ukAny) return ukAny;

  const usFemale = voices.find(v => v.lang === 'en-US' && /female|f\b/i.test(v.name));
  if (usFemale) return usFemale;

  const enFemale = voices.find(v => v.lang.startsWith('en') && /female|f\b/i.test(v.name));
  if (enFemale) return enFemale;

  const en = voices.filter(v => v.lang.startsWith('en'));
  return en[0] ?? voices[0] ?? null;
}

function speakChunks(chunks: string[], index: number, sessionId: number, options: SpeakOptions): void {
  if (sessionId !== activeSessionId || index >= chunks.length) {
    if (sessionId === activeSessionId) {
      stopKeepAlive();
      options.onEnd?.();
    }
    return;
  }

  const chunk = chunks[index];
  const utt = new SpeechSynthesisUtterance(chunk);
  utt.lang = 'en-GB';
  utt.rate = options.profile === 'clinical' ? 0.9 : 0.95;
  utt.pitch = 1.1;
  utt.volume = 1;

  const voice = pickVoice(options.profile);
  if (voice) utt.voice = voice;

  utt.onboundary = (e) => {
    if (e.name === 'word' && options.onWord) {
      const word = chunk.slice(e.charIndex, e.charIndex + e.charLength);
      options.onWord(word, e.charIndex);
    }
  };

  utt.onend = () => {
    if (sessionId !== activeSessionId) return;
    setTimeout(() => speakChunks(chunks, index + 1, sessionId, options), 80);
  };

  utt.onerror = (e) => {
    if (sessionId !== activeSessionId) return;
    const err = (e as SpeechSynthesisErrorEvent).error;
    if (err === 'interrupted' || err === 'canceled') return;
    stopKeepAlive();
    options.onError?.();
  };

  window.speechSynthesis.speak(utt);
}

export function speak(text: string, options: SpeakOptions): void {
  if (!('speechSynthesis' in window)) return;

  activeSessionId += 1;
  const sessionId = activeSessionId;

  window.speechSynthesis.cancel();

  const chunks = splitIntoChunks(text);

  const startSpeaking = () => {
    if (sessionId !== activeSessionId) return;
    startKeepAlive();
    speakChunks(chunks, 0, sessionId, options);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    startSpeaking();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      startSpeaking();
    };
  }
}

export function stopSpeaking(): void {
  activeSessionId += 1;
  stopKeepAlive();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function pauseSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

export function isTTSSupported(): boolean {
  return 'speechSynthesis' in window;
}

export function isSTTSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

export function startListening(
  onResult: (transcript: string) => void,
  onEnd: () => void,
): void {
  if (!isSTTSupported()) return;

  const win = window as unknown as WindowWithSR;
  const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (!SR) return;

  stopListening();

  const rec = new SR();
  rec.lang = 'en-GB';
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  rec.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    onResult(transcript);
  };

  rec.onend = () => {
    recognition = null;
    onEnd();
  };

  rec.onerror = () => {
    recognition = null;
    onEnd();
  };

  recognition = rec;
  rec.start();
}

export function stopListening(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
