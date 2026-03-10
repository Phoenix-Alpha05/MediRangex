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

function pickVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const preferred = profile === 'clinical'
    ? ['George', 'Daniel', 'Alex', 'Google UK English Male', 'Google US English']
    : ['Zira', 'Samantha', 'Karen', 'Google UK English Female', 'Google US English'];

  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }

  const en = voices.filter(v => v.lang.startsWith('en'));
  return en[0] ?? voices[0] ?? null;
}

export function speak(text: string, options: SpeakOptions): void {
  if (!('speechSynthesis' in window)) return;

  stopSpeaking();

  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = options.profile === 'clinical' ? 0.88 : 0.95;
  utt.pitch = options.profile === 'clinical' ? 0.95 : 1.05;
  utt.volume = 1;

  const setVoiceAndSpeak = () => {
    const voice = pickVoice(options.profile);
    if (voice) utt.voice = voice;

    utt.onboundary = (e) => {
      if (e.name === 'word' && options.onWord) {
        const word = text.slice(e.charIndex, e.charIndex + e.charLength);
        options.onWord(word, e.charIndex);
      }
    };

    utt.onend = () => {
      options.onEnd?.();
    };

    utt.onerror = () => {
      options.onError?.();
    };

    window.speechSynthesis.speak(utt);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    setVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      setVoiceAndSpeak();
    };
  }
}

export function stopSpeaking(): void {
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
  rec.lang = 'en-US';
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
