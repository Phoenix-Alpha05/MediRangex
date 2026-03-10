import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak, stopSpeaking, isTTSSupported } from '../../ai-guide/voiceEngine';

interface DemoStep {
  time: string;
  title: string;
  subtitle: string;
  riskScore: number;
  riskLabel: string;
  riskColor: string;
  phase: string;
  vitals: { hr: number; rr: number; sbp: number; temp: number; lactate?: number };
  narrative: string;
  voiceScript: string;
  panel: 'clinical' | 'medication' | 'operations' | 'command';
  activePanel?: string;
  triggeredFactors: string[];
  actions?: string[];
  warning?: string;
  drugWarning?: string;
  opsAlert?: string;
}

const STEPS: DemoStep[] = [
  {
    time: 'T+0s',
    title: 'Baseline Stable',
    subtitle: 'Patient admitted, continuous monitoring active',
    riskScore: 2,
    riskLabel: 'LOW',
    riskColor: '#10b981',
    phase: 'BASELINE',
    vitals: { hr: 76, rr: 14, sbp: 122, temp: 37.0 },
    narrative: 'Patient stable. Continuous monitoring active. All vitals within normal parameters.',
    voiceScript: 'Patient MRX-ICU-0427, John D., 64 years old, admitted to ICU Bay 3. All vital signs are within normal parameters. Heart rate 76 beats per minute. Respiratory rate 14. Systolic blood pressure 122. Risk score is 2 out of 12 — low risk. Continuous monitoring is active across all physiological channels.',
    panel: 'clinical',
    triggeredFactors: [],
  },
  {
    time: 'T+8s',
    title: 'Early Physiological Shift',
    subtitle: 'HR and respiratory rate elevating — SIRS criteria triggered',
    riskScore: 4,
    riskLabel: 'MODERATE',
    riskColor: '#f59e0b',
    phase: 'EARLY_SHIFT',
    vitals: { hr: 101, rr: 21, sbp: 112, temp: 38.2 },
    narrative: 'Subtle deterioration detected before visible symptoms. SIRS criteria triggered.',
    voiceScript: 'Subtle physiological changes are emerging. Heart rate has risen to 101 beats per minute. Respiratory rate is now 21. Temperature has elevated to 38.2 degrees Celsius. The system has detected 3 of 4 SIRS criteria, pushing the risk score to 4 — moderate range. This early pattern of systemic inflammation would not yet trigger a standard clinical alert. MediRangeX is already watching.',
    panel: 'clinical',
    triggeredFactors: ['HR > 90 bpm', 'RR > 20/min', 'Temp > 38.0°C'],
    warning: 'SIRS Criteria: 3/4 met',
  },
  {
    time: 'T+16s',
    title: 'Hypoperfusion Signal',
    subtitle: 'SBP dropping, lactate elevated — perfusion failure suspected',
    riskScore: 7,
    riskLabel: 'HIGH',
    riskColor: '#f97316',
    phase: 'HYPOPERFUSION',
    vitals: { hr: 124, rr: 26, sbp: 88, temp: 38.9, lactate: 2.8 },
    narrative: 'Perfusion failure suspected. Early sepsis likely. Hypoperfusion rules firing.',
    voiceScript: 'A critical perfusion signal has been detected. Systolic blood pressure has dropped to 88 millimeters of mercury. Lactate is now elevated at 2.8 millimoles per liter — a key biochemical marker of tissue hypoperfusion. Risk score has risen to 7, placing this patient firmly in the high-risk category. The sepsis engine is identifying a pattern consistent with early distributive shock. Immediate clinical review is now recommended.',
    panel: 'clinical',
    triggeredFactors: ['HR > 90 bpm', 'SBP < 90 mmHg', 'Lactate > 2 mmol/L', 'RR > 20/min', 'Temp > 38.0°C'],
    warning: 'Hypoperfusion Pattern Detected',
    activePanel: 'alerts',
  },
  {
    time: 'T+24s',
    title: 'Critical Threshold',
    subtitle: 'Multi-signal convergence — sepsis protocol triggered',
    riskScore: 9,
    riskLabel: 'CRITICAL',
    riskColor: '#ef4444',
    phase: 'CRITICAL',
    vitals: { hr: 138, rr: 30, sbp: 78, temp: 39.4, lactate: 4.1 },
    narrative: 'System flags high mortality risk — 6 hours before standard escalation would occur.',
    voiceScript: 'Sepsis protocol has been activated. Risk score is now 9 out of 12. Heart rate 138. Systolic blood pressure 78. Lactate has risen to 4.1 millimoles per liter — indicating severe tissue hypoperfusion and multi-organ dysfunction risk. The system has identified this critical pattern 6 hours before standard clinical escalation would typically occur. Recommended actions include blood cultures, broad-spectrum antibiotics, lactate measurement, IV fluid resuscitation, and immediate ICU review.',
    panel: 'clinical',
    triggeredFactors: ['HR > 90 bpm', 'SBP < 90 mmHg', 'Lactate > 4 mmol/L', 'RR > 20/min', 'Temp > 39°C', 'Multi-organ dysfunction'],
    actions: ['Blood cultures ×2', 'Broad-spectrum antibiotics', 'Lactate measurement', 'IV fluid resuscitation', 'ICU review'],
    warning: 'SEPSIS PROTOCOL ACTIVATED',
    activePanel: 'highRisk',
  },
  {
    time: 'T+32s',
    title: 'Drug Safety Cross-Check',
    subtitle: 'Antibiotic ordered — interaction scan running in real time',
    riskScore: 9,
    riskLabel: 'CRITICAL',
    riskColor: '#ef4444',
    phase: 'DRUG_CHECK',
    vitals: { hr: 138, rr: 30, sbp: 78, temp: 39.4, lactate: 4.1 },
    narrative: 'Therapy safety validated in real time. Renal modifier applied — dose adjustment recommended.',
    voiceScript: 'The clinical team has ordered Piperacillin-Tazobactam. The drug safety engine is now performing a real-time cross-reference against this patient\'s complete medication profile and clinical context. Alert detected: renal function is impaired, with creatinine clearance below 40 milliliters per minute. A standard dose would risk nephrotoxicity. The system recommends reducing to 2.25 grams every 8 hours, monitoring renal function every 12 hours, and avoiding concurrent nephrotoxins. Therapy validated and personalized — in real time.',
    panel: 'medication',
    triggeredFactors: ['Broad-spectrum ABx ordered', 'Renal function impaired', 'Drug interaction scan active'],
    drugWarning: 'Piperacillin-Tazobactam: Renal dose adjustment required (CrCl < 40)',
    actions: ['Reduce dose to 2.25g q8h', 'Monitor renal function q12h', 'Avoid concurrent nephrotoxins'],
  },
  {
    time: 'T+40s',
    title: 'Operations Impact',
    subtitle: 'ICU occupancy surge — capacity forecast triggered',
    riskScore: 9,
    riskLabel: 'CRITICAL',
    riskColor: '#ef4444',
    phase: 'OPS_IMPACT',
    vitals: { hr: 138, rr: 30, sbp: 78, temp: 39.4, lactate: 4.1 },
    narrative: 'Hospital operations adapt automatically. Bed allocation optimized.',
    voiceScript: 'ICU occupancy has reached 85 percent. The operations forecasting engine has detected that this patient\'s admission is creating a surge condition. Only 2 ICU beds remain. Rather than waiting for a capacity crisis, the system is already recommending to expedite discharge reviews, activate surge protocol, and notify the on-call administrator. Operational awareness — ahead of the event, not after it.',
    panel: 'operations',
    triggeredFactors: ['ICU occupancy > 85%', 'Surge threshold approaching', 'Step-down unit at capacity'],
    opsAlert: 'ICU SURGE WARNING — 2 beds remaining',
    actions: ['Expedite ICU discharge review', 'Activate surge protocol', 'Notify on-call administrator'],
  },
  {
    time: 'T+48s',
    title: 'Command Center Unified',
    subtitle: 'All systems coordinated — total situational awareness achieved',
    riskScore: 9,
    riskLabel: 'CRITICAL',
    riskColor: '#ef4444',
    phase: 'COMMAND',
    vitals: { hr: 138, rr: 30, sbp: 78, temp: 39.4, lactate: 4.1 },
    narrative: 'One platform. Total situational awareness. Clinical risk, medication safety, capacity forecast, and model health — unified.',
    voiceScript: 'This is the MediRangeX Command Center — your unified clinical intelligence hub. In this single scenario, the platform detected sepsis 6 hours before a standard crash, prevented an adverse drug event, and optimized ICU capacity before a crisis developed. Clinical risk, medication safety, operational forecasting, and AI model health — all unified in one intelligence layer, operating in real time. Enter the Command Center to experience it live.',
    panel: 'command',
    triggeredFactors: ['Clinical: CRITICAL', 'Medication: ALERT ACTIVE', 'Operations: SURGE WARNING', 'ML: 94% confidence'],
    actions: ['Enter Command Center'],
  },
];

interface VitalItemProps {
  label: string;
  value: string;
  unit: string;
  color: string;
  abnormal: boolean;
}

function VitalItem({ label, value, unit, color, abnormal }: VitalItemProps) {
  return (
    <div style={{
      background: abnormal ? `${color}10` : 'rgba(255,255,255,0.02)',
      border: `1px solid ${abnormal ? color + '30' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '0.5rem',
      padding: '0.625rem 0.875rem',
      transition: 'all 0.4s ease',
    }}>
      <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {label}
        {abnormal && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}` }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: abnormal ? color : '#e2e8f0', transition: 'color 0.4s ease' }}>
          {value}
        </span>
        <span style={{ fontSize: '0.6rem', color: '#475569' }}>{unit}</span>
      </div>
    </div>
  );
}

function ReasoningPanel({ step }: { step: DemoStep }) {
  return (
    <div style={{
      background: 'rgba(5,8,16,0.95)',
      border: '1px solid rgba(56,189,248,0.15)',
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      animation: 'fade-up 0.3s ease forwards',
    }}>
      <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
        </svg>
        AI Reasoning
      </div>
      <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '0.75rem' }}>
        {step.narrative}
      </div>
      {step.triggeredFactors.length > 0 && (
        <div>
          <div style={{ fontSize: '0.6rem', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Triggered Factors</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {step.triggeredFactors.map((f, i) => (
              <span key={i} style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '9999px',
                background: `${step.riskColor}15`,
                border: `1px solid ${step.riskColor}30`,
                color: step.riskColor,
                fontWeight: 600,
              }}>{f}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ImpactSummary({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ animation: 'fade-up 0.5s ease forwards' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#38bdf8', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Demo Complete
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
          Impact Summary
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { metric: '6 hours', label: 'Intervention window gained', color: '#10b981' },
          { metric: '1 ADR', label: 'Adverse drug event prevented', color: '#f59e0b' },
          { metric: '0 beds', label: 'Capacity crisis avoided', color: '#38bdf8' },
          { metric: '94%', label: 'Model prediction confidence', color: '#818cf8' },
        ].map(m => (
          <div key={m.label} style={{
            background: 'rgba(8,12,20,0.9)',
            border: `1px solid ${m.color}25`,
            borderRadius: '0.625rem',
            padding: '0.875rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: m.color, letterSpacing: '-0.02em' }}>
              {m.metric}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.2rem', lineHeight: 1.4 }}>{m.label}</div>
          </div>
        ))}
      </div>
      <button
        className="btn-primary"
        onClick={onEnter}
        style={{ width: '100%', padding: '0.875rem', fontSize: '0.9rem', fontWeight: 700, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        Enter Command Center
        <span>→</span>
      </button>
    </div>
  );
}

function WaveformBars({ color }: { color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            width: '3px',
            borderRadius: '2px',
            background: color,
            animation: `guide-wave 1.1s ease-in-out ${i * 0.12}s infinite`,
            height: i % 2 === 0 ? '10px' : '16px',
          }}
        />
      ))}
    </div>
  );
}

function SubtitleBar({ text, color, visible }: { text: string; color: string; visible: boolean }) {
  if (!visible || !text) return null;
  return (
    <div style={{
      position: 'relative',
      padding: '0.75rem 1rem 0.75rem 1.25rem',
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: '0.5rem',
      animation: 'fade-up 0.2s ease forwards',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '3px',
        height: '100%',
        background: color,
        opacity: 0.7,
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
        <WaveformBars color={color} />
        <p style={{
          margin: 0,
          fontSize: '0.78rem',
          color: '#c8d3e2',
          lineHeight: 1.65,
          fontStyle: 'italic',
          flex: 1,
        }}>
          {text}
        </p>
      </div>
    </div>
  );
}

export default function ClinicalDemoSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [subtitleText, setSubtitleText] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const ttsSupported = isTTSSupported();
  const navigate = useNavigate();
  const playingRef = useRef(false);

  const step = STEPS[currentStep];

  const handleStepComplete = useCallback((completedIndex: number) => {
    if (!playingRef.current) return;

    const nextIndex = completedIndex + 1;

    if (nextIndex >= STEPS.length) {
      setPlaying(false);
      setIsSpeaking(false);
      setSubtitleText('');
      playingRef.current = false;
      setShowImpact(true);

      if (voiceEnabled && ttsSupported) {
        speak(
          'Demo complete. MediRangeX detected the crisis, protected the patient, and coordinated the entire care pathway — automatically.',
          {
            profile: 'investor',
            onEnd: () => { setIsSpeaking(false); setSubtitleText(''); },
            onError: () => { setIsSpeaking(false); setSubtitleText(''); },
          },
        );
        setIsSpeaking(true);
        setSubtitleText('Demo complete. MediRangeX detected the crisis, protected the patient, and coordinated the entire care pathway — automatically.');
      }
      return;
    }

    setCurrentStep(nextIndex);
  }, [voiceEnabled, ttsSupported]);

  const speakStep = useCallback((index: number) => {
    if (!voiceEnabled || !ttsSupported) return;

    const script = STEPS[index].voiceScript;
    setSubtitleText(script);
    setIsSpeaking(true);

    speak(script, {
      profile: 'investor',
      onEnd: () => {
        setIsSpeaking(false);
        setSubtitleText('');
        setTimeout(() => handleStepComplete(index), 300);
      },
      onError: () => {
        setIsSpeaking(false);
        setSubtitleText('');
        setTimeout(() => handleStepComplete(index), 300);
      },
    });
  }, [voiceEnabled, ttsSupported, handleStepComplete]);

  const startPlay = useCallback(() => {
    setPlaying(true);
    setShowImpact(false);
    playingRef.current = true;

    if (voiceEnabled && ttsSupported) {
      speakStep(currentStep);
    } else {
      const interval = setInterval(() => {
        setCurrentStep(s => {
          if (s >= STEPS.length - 1) {
            clearInterval(interval);
            setPlaying(false);
            playingRef.current = false;
            setShowImpact(true);
            return s;
          }
          return s + 1;
        });
      }, 3000);
    }
  }, [currentStep, voiceEnabled, ttsSupported, speakStep]);

  const stopPlay = useCallback(() => {
    stopSpeaking();
    playingRef.current = false;
    setPlaying(false);
    setIsSpeaking(false);
    setSubtitleText('');
  }, []);

  const reset = useCallback(() => {
    stopPlay();
    setCurrentStep(0);
    setShowImpact(false);
    setShowReasoning(false);
  }, [stopPlay]);

  const skipToCritical = useCallback(() => {
    stopPlay();
    setCurrentStep(3);
    setShowImpact(false);
  }, [stopPlay]);

  const handleManualStepSelect = useCallback((index: number) => {
    stopPlay();
    setCurrentStep(index);
    setShowImpact(false);
  }, [stopPlay]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      playingRef.current = false;
    };
  }, []);

  const v = step.vitals;
  const isHRAbnormal = v.hr > 100;
  const isRRAbnormal = v.rr > 20;
  const isSBPAbnormal = v.sbp < 90;
  const isTempAbnormal = v.temp > 38.0;
  const progress = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <section id="clinical-demo" style={{ padding: '7rem 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '70%',
        height: 400,
        background: 'radial-gradient(ellipse, rgba(239,68,68,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="tag tag-cyan" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38bdf8', animation: 'pulse-dot 1.5s ease-in-out infinite', display: 'inline-block', marginRight: '0.3rem' }} />
            Guided Clinical Scenario
          </span>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            margin: '1rem 0 1rem',
            color: '#f0f4ff',
          }}>
            Early Sepsis Detection
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: 560, margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            6 hours before a standard crash. Watch MediRangeX detect, reason, and act across
            every dimension of care in real time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              background: 'rgba(8,12,20,0.9)',
              border: `1px solid ${step.riskColor}30`,
              borderRadius: '0.875rem',
              overflow: 'hidden',
              transition: 'border-color 0.4s ease',
            }}>
              <div style={{ padding: '0.875rem 1rem', background: 'rgba(5,8,16,0.8)', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patient ID: MRX-ICU-0427</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>John D. · ICU Bay 3 · Age 64</div>
                </div>
                <div style={{
                  padding: '0.25rem 0.625rem',
                  borderRadius: '9999px',
                  background: `${step.riskColor}20`,
                  border: `1px solid ${step.riskColor}40`,
                  color: step.riskColor,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  transition: 'all 0.4s ease',
                }}>
                  {step.riskLabel}
                </div>
              </div>

              <div style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: '0.15rem' }}>Sepsis Risk Score</div>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: step.riskColor,
                      lineHeight: 1,
                      transition: 'color 0.4s ease',
                    }}>
                      {step.riskScore}<span style={{ fontSize: '1rem', color: '#475569', fontWeight: 400 }}>/12</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.35rem' }}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 2,
                          background: i < step.riskScore ? step.riskColor : 'rgba(255,255,255,0.05)',
                          transition: 'background 0.4s ease',
                          boxShadow: i < step.riskScore ? `0 0 4px ${step.riskColor}60` : 'none',
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                      <span>LOW</span><span>CRITICAL</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <VitalItem label="Heart Rate" value={String(v.hr)} unit="bpm" color="#f43f5e" abnormal={isHRAbnormal} />
                  <VitalItem label="Resp. Rate" value={String(v.rr)} unit="/min" color="#f59e0b" abnormal={isRRAbnormal} />
                  <VitalItem label="Systolic BP" value={String(v.sbp)} unit="mmHg" color="#38bdf8" abnormal={isSBPAbnormal} />
                  <VitalItem label="Temperature" value={v.temp.toFixed(1)} unit="°C" color="#f97316" abnormal={isTempAbnormal} />
                  {v.lactate && (
                    <div style={{ gridColumn: 'span 2' }}>
                      <VitalItem label="Lactate" value={v.lactate.toFixed(1)} unit="mmol/L" color="#ef4444" abnormal={v.lactate > 2} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {showImpact ? (
              <ImpactSummary onEnter={() => navigate('/dashboard/command-center')} />
            ) : (
              <ReasoningPanel step={step} />
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(8,12,20,0.9)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '0.875rem',
              padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                    {step.time} — {step.phase}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f4ff', marginTop: '0.1rem' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{step.subtitle}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {ttsSupported && (
                    <button
                      onClick={() => {
                        if (playing) stopPlay();
                        setVoiceEnabled(v => !v);
                      }}
                      title={voiceEnabled ? 'Mute narration' : 'Enable narration'}
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: voiceEnabled ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${voiceEnabled ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: '0.375rem',
                        color: voiceEnabled ? '#38bdf8' : '#475569',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        transition: 'all 0.15s ease',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {voiceEnabled ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <line x1="23" x2="17" y1="9" y2="15" /><line x1="17" x2="23" y1="9" y2="15" />
                        </svg>
                      )}
                      {voiceEnabled ? 'Voice On' : 'Voice Off'}
                    </button>
                  )}
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '0.375rem',
                    background: `${step.riskColor}12`,
                    border: `1px solid ${step.riskColor}30`,
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: step.riskColor,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}>
                    {step.panel === 'clinical' ? 'Clinical Risk' : step.panel === 'medication' ? 'Drug Safety' : step.panel === 'operations' ? 'Operations' : 'Command Center'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#475569', marginBottom: '0.3rem' }}>
                  <span>Progress</span>
                  <span>{currentStep + 1} / {STEPS.length}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, #38bdf8, ${step.riskColor})`,
                    borderRadius: 2,
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: subtitleText ? '0.75rem' : '0' }}>
                <button
                  className={playing ? 'btn-ghost' : 'btn-primary'}
                  onClick={playing ? stopPlay : startPlay}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    position: 'relative',
                  }}
                >
                  {playing ? (
                    <>
                      {isSpeaking && voiceEnabled ? <WaveformBars color="#94a3b8" /> : <span>⏸</span>}
                      {isSpeaking && voiceEnabled ? 'Narrating...' : 'Pause'}
                    </>
                  ) : (
                    <>
                      {voiceEnabled && ttsSupported ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                      ) : (
                        <span>▶</span>
                      )}
                      Play Demo
                    </>
                  )}
                </button>
                <button className="btn-ghost" onClick={reset} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  ⟲ Reset
                </button>
                <button className="btn-ghost" onClick={skipToCritical} style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
                  ⏭ Skip to Critical
                </button>
                <button
                  className={showReasoning ? 'btn-primary' : 'btn-ghost'}
                  onClick={() => setShowReasoning(r => !r)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  AI Reasoning
                </button>
              </div>

              <SubtitleBar
                text={subtitleText}
                color={step.riskColor}
                visible={isSpeaking && voiceEnabled}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
              {STEPS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleManualStepSelect(i)}
                  style={{
                    background: i === currentStep ? `${s.riskColor}20` : 'rgba(8,12,20,0.8)',
                    border: `1px solid ${i === currentStep ? s.riskColor + '50' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: '0.375rem',
                    padding: '0.5rem 0.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.riskColor, boxShadow: i === currentStep ? `0 0 8px ${s.riskColor}` : 'none' }} />
                  <span style={{ fontSize: '0.5rem', color: i === currentStep ? s.riskColor : '#475569', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                    {s.time}
                  </span>
                </button>
              ))}
            </div>

            {step.warning && (
              <div style={{
                background: `${step.riskColor}08`,
                border: `1px solid ${step.riskColor}30`,
                borderRadius: '0.625rem',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: step.riskColor, flexShrink: 0, boxShadow: `0 0 8px ${step.riskColor}`, animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: step.riskColor }}>{step.warning}</span>
              </div>
            )}

            {step.drugWarning && (
              <div style={{
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '0.625rem',
                padding: '0.875rem 1rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Drug Interaction Warning
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.625rem' }}>{step.drugWarning}</div>
                {step.actions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {step.actions.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step.opsAlert && (
              <div style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.625rem',
                padding: '0.875rem 1rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  Operations Alert
                </div>
                <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, marginBottom: '0.625rem' }}>{step.opsAlert}</div>
                {step.actions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {step.actions.map((a, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                        <div style={{ width: 3, height: 3, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                        {a}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step.actions && !step.drugWarning && !step.opsAlert && (
              <div style={{
                background: 'rgba(8,12,20,0.9)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.625rem',
                padding: '0.875rem 1rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.625rem' }}>
                  {step.panel === 'command' ? 'Next Step' : 'Recommended Actions'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {step.actions.map((action, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      {step.panel === 'command' ? (
                        <button
                          className="btn-primary"
                          onClick={() => navigate('/dashboard/command-center')}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          {action} →
                        </button>
                      ) : (
                        <>
                          <div style={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: `${step.riskColor}20`,
                            border: `1px solid ${step.riskColor}40`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={step.riskColor} strokeWidth="3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#e2e8f0' }}>{action}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showReasoning && (
              <div style={{
                background: 'rgba(5,8,16,0.95)',
                border: '1px solid rgba(56,189,248,0.2)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                animation: 'fade-up 0.3s ease forwards',
              }}>
                <div style={{ fontSize: '0.65rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  Extended AI Reasoning
                </div>
                {[
                  { label: 'Scoring Logic', value: `Risk score ${step.riskScore}/12 based on ${step.triggeredFactors.length} active criteria` },
                  { label: 'Evidence Basis', value: 'Sepsis-3 definitions, SIRS criteria, SOFA scoring integration' },
                  { label: 'Confidence Level', value: step.riskScore >= 7 ? '94% — High confidence. Multiple corroborating signals.' : step.riskScore >= 4 ? '78% — Moderate confidence. Early warning pattern.' : '61% — Low confidence. Monitoring phase.' },
                  { label: 'Causal Chain', value: `${step.triggeredFactors[0] ?? 'Monitoring'} → ${step.triggeredFactors[1] ?? 'Baseline'} → Risk Escalation` },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '0.625rem', paddingBottom: '0.625rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.15rem' }}>{item.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {[
                { label: 'Clinical Risk', active: step.panel === 'clinical' || step.panel === 'command', color: step.riskColor, icon: '⚕' },
                { label: 'Drug Safety', active: step.panel === 'medication' || step.panel === 'command', color: '#f59e0b', icon: '💊' },
                { label: 'Operations', active: step.panel === 'operations' || step.panel === 'command', color: '#38bdf8', icon: '🏥' },
                { label: 'ML Engine', active: step.panel === 'command', color: '#818cf8', icon: '🧠' },
              ].map(p => (
                <div key={p.label} style={{
                  background: p.active ? `${p.color}10` : 'rgba(8,12,20,0.6)',
                  border: `1px solid ${p.active ? p.color + '30' : 'rgba(255,255,255,0.04)'}`,
                  borderRadius: '0.5rem',
                  padding: '0.625rem',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{p.icon}</div>
                  <div style={{ fontSize: '0.6rem', color: p.active ? p.color : '#475569', fontWeight: p.active ? 700 : 400, transition: 'color 0.4s ease', letterSpacing: '0.04em' }}>
                    {p.label}
                  </div>
                  <div style={{ marginTop: '0.25rem', width: 4, height: 4, borderRadius: '50%', background: p.active ? p.color : '#1e293b', margin: '0.25rem auto 0', boxShadow: p.active ? `0 0 6px ${p.color}` : 'none', transition: 'all 0.4s ease' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
