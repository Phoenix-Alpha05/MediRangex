import { useRef, type KeyboardEvent } from 'react';
import { useAIGuide } from './useAIGuide';
import { HighlightOverlay } from './HighlightOverlay';

function OrbIcon({ status, color }: { status: string; color: string }) {
  if (status === 'speaking') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            style={{
              width: '3px',
              borderRadius: '2px',
              background: color,
              animation: `guide-wave 1.2s ease-in-out ${i * 0.15}s infinite`,
              height: i % 2 === 0 ? '12px' : '18px',
            }}
          />
        ))}
      </div>
    );
  }
  if (status === 'listening') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2m18 0h-2M8 20v-2m8 2v-2" />
      <circle cx="12" cy="14" r="2" fill={color} opacity="0.8" />
    </svg>
  );
}

function StatusDot({ status, color }: { status: string; color: string }) {
  return (
    <div style={{
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: status === 'idle' ? '#4e5f74' : color,
      boxShadow: status !== 'idle' ? `0 0 8px ${color}` : 'none',
      animation: status === 'speaking' ? 'guide-orb-pulse 1.5s ease-in-out infinite' : 'none',
      flexShrink: 0,
    }} />
  );
}

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ padding: '0 16px 10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '9px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Step {current} of {total}
        </span>
        <span style={{ fontSize: '9px', color: '#4e5f74', fontFamily: "'JetBrains Mono', monospace" }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          borderRadius: '2px',
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 6px ${color}60`,
        }} />
      </div>
    </div>
  );
}

function SubtitleDisplay({ text, color }: { text: string; color: string }) {
  if (!text) return null;
  return (
    <div style={{
      margin: '0 16px 10px',
      padding: '10px 12px',
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: '6px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '3px',
        height: '100%',
        background: color,
        opacity: 0.6,
      }} />
      <p style={{
        margin: 0,
        fontSize: '11px',
        color: '#c8d3e2',
        lineHeight: 1.6,
        fontStyle: 'italic',
      }}>
        {text}
      </p>
    </div>
  );
}

function ControlButton({
  onClick,
  accent,
  ghost,
  children,
  disabled,
  small,
}: {
  onClick: () => void;
  accent?: boolean;
  ghost?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '5px',
        padding: small ? '5px 10px' : '7px 14px',
        background: accent
          ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(59,130,246,0.1))'
          : ghost
            ? 'transparent'
            : 'rgba(255,255,255,0.04)',
        border: accent
          ? '1px solid rgba(56,189,248,0.25)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '5px',
        color: disabled ? '#4e5f74' : accent ? '#38bdf8' : '#8b9ab5',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'all 0.15s ease',
        flex: 1,
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = accent
            ? 'rgba(56,189,248,0.18)'
            : 'rgba(255,255,255,0.07)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = accent
            ? 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(59,130,246,0.1))'
            : ghost ? 'transparent' : 'rgba(255,255,255,0.04)';
        }
      }}
    >
      {children}
    </button>
  );
}

export function AIGuideWidget() {
  const guide = useAIGuide();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!guide.qaQuestion.trim()) return;
    guide.askQuestion(guide.qaQuestion);
    guide.setQaQuestion('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  const accentColor = guide.accentColor;
  const isClinical = guide.mode === 'clinical';

  const currentStep = guide.isTourActive && guide.currentStepIndex > 0
    ? guide.steps[guide.currentStepIndex - 1]
    : null;

  return (
    <>
      <HighlightOverlay targetSelector={guide.highlightTarget} color={guide.highlightColor} />

      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '12px',
      }}>
        {guide.isOpen && (
          <div style={{
            width: '320px',
            background: '#0d1219',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
            animation: 'guide-panel-in 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: `linear-gradient(135deg, ${accentColor}12, ${accentColor}06)`,
              borderBottom: `1px solid ${accentColor}18`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusDot status={guide.status} color={accentColor} />
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: accentColor }}>
                    {guide.status === 'speaking' ? 'Speaking' : guide.status === 'listening' ? 'Listening' : guide.status === 'paused' ? 'Paused' : 'AI Guide'}
                  </div>
                  <div style={{ fontSize: '9px', color: '#4e5f74', letterSpacing: '0.06em' }}>
                    {isClinical ? 'Clinical Intelligence' : 'Investor Overview'}
                  </div>
                </div>
              </div>
              <button
                onClick={guide.toggleOpen}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#4e5f74',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  borderRadius: '4px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#8b9ab5'; }}
                onMouseLeave={e => { (e.currentTarget).style.color = '#4e5f74'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div style={{
              display: 'flex',
              margin: '12px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
              overflow: 'hidden',
            }}>
              {(['clinical', 'investor'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => guide.switchMode(m)}
                  style={{
                    flex: 1,
                    padding: '7px',
                    background: guide.mode === m ? `${accentColor}18` : 'transparent',
                    border: 'none',
                    borderBottom: guide.mode === m ? `2px solid ${accentColor}` : '2px solid transparent',
                    color: guide.mode === m ? accentColor : '#4e5f74',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    transition: 'all 0.15s ease',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                >
                  {m === 'clinical' ? 'Clinical' : 'Investor'}
                </button>
              ))}
            </div>

            {guide.isTourActive && guide.currentStepIndex > 0 && (
              <>
                {currentStep && (
                  <div style={{ padding: '0 16px 8px' }}>
                    <div style={{ fontSize: '9px', color: accentColor, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {currentStep.title}
                    </div>
                  </div>
                )}
                <ProgressBar
                  current={Math.min(guide.currentStepIndex, guide.totalSteps)}
                  total={guide.totalSteps}
                  color={accentColor}
                />
              </>
            )}

            {guide.subtitleText && (
              <SubtitleDisplay text={guide.subtitleText} color={accentColor} />
            )}

            {guide.qaAnswer && !guide.subtitleText && (
              <div style={{
                margin: '0 16px 10px',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
              }}>
                <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Response
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#c8d3e2', lineHeight: 1.6 }}>
                  {guide.qaAnswer}
                </p>
              </div>
            )}

            <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!guide.isTourActive ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <ControlButton onClick={guide.startTour} accent>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Start Tour
                  </ControlButton>
                  {guide.status === 'speaking' && (
                    <ControlButton onClick={guide.stopTour}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                      Stop
                    </ControlButton>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!guide.isPaused ? (
                    <ControlButton onClick={guide.pauseTour} disabled={guide.status !== 'speaking'}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Pause
                    </ControlButton>
                  ) : (
                    <ControlButton onClick={guide.resumeTour} accent>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Resume
                    </ControlButton>
                  )}
                  <ControlButton onClick={guide.restartTour}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                    </svg>
                    Restart
                  </ControlButton>
                  <ControlButton onClick={guide.stopTour}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="6" width="12" height="12" />
                    </svg>
                    Stop
                  </ControlButton>
                </div>
              )}

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '2px 0' }} />

              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  ref={inputRef}
                  value={guide.qaQuestion}
                  onChange={e => guide.setQaQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isClinical ? 'Ask a clinical question...' : 'Ask about the platform...'}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '5px',
                    color: '#e8ecf4',
                    fontSize: '11px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = `${accentColor}50`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                />
                {guide.sttSupported && (
                  <button
                    onClick={guide.isListening ? guide.stopVoiceInput : guide.startVoiceInput}
                    style={{
                      padding: '7px 10px',
                      background: guide.isListening ? `${accentColor}20` : 'rgba(255,255,255,0.04)',
                      border: guide.isListening ? `1px solid ${accentColor}40` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '5px',
                      color: guide.isListening ? accentColor : '#4e5f74',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      animation: guide.isListening ? 'guide-orb-pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={handleSend}
                  disabled={!guide.qaQuestion.trim()}
                  style={{
                    padding: '7px 12px',
                    background: guide.qaQuestion.trim() ? `${accentColor}18` : 'transparent',
                    border: guide.qaQuestion.trim() ? `1px solid ${accentColor}30` : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '5px',
                    color: guide.qaQuestion.trim() ? accentColor : '#4e5f74',
                    cursor: guide.qaQuestion.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    transition: 'all 0.15s ease',
                  }}
                >
                  Ask
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {(isClinical
                  ? ['How is sepsis risk calculated?', 'What triggers a critical alert?', 'Can this integrate with Epic?']
                  : ['What\'s your competitive moat?', 'How do you monetize?', 'What\'s deployment time?']
                ).map(q => (
                  <button
                    key={q}
                    onClick={() => { guide.setQaQuestion(q); guide.askQuestion(q); }}
                    style={{
                      padding: '3px 8px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.07)',
                      borderRadius: '20px',
                      color: '#4e5f74',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontFamily: "'Inter', system-ui, sans-serif",
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget).style.borderColor = `${accentColor}30`;
                      (e.currentTarget).style.color = accentColor;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget).style.borderColor = 'rgba(255,255,255,0.07)';
                      (e.currentTarget).style.color = '#4e5f74';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {!guide.ttsSupported && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: '9px', color: '#4e5f74' }}>Voice unavailable in this browser. Text mode active.</span>
              </div>
            )}
          </div>
        )}

        <button
          onClick={guide.toggleOpen}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: guide.isOpen
              ? `${accentColor}20`
              : `linear-gradient(135deg, ${accentColor}25, ${accentColor}10)`,
            border: `1.5px solid ${guide.isOpen ? accentColor : accentColor + '50'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: guide.status === 'speaking'
              ? `0 0 0 0 ${accentColor}40, 0 8px 32px rgba(0,0,0,0.4)`
              : `0 8px 32px rgba(0,0,0,0.4)`,
            animation: guide.status === 'speaking'
              ? 'guide-orb-ring 1.8s ease-out infinite'
              : 'none',
            transition: 'all 0.2s ease',
          }}
          title={guide.isOpen ? 'Close AI Guide' : 'Open AI Guide'}
        >
          <OrbIcon status={guide.status} color={accentColor} />
        </button>
      </div>
    </>
  );
}
