import { SlideOver } from '../ui/SlideOver';
import { RiskBadge } from '../ui/RiskBadge';
import { Tooltip } from '../ui/Tooltip';
import type { ClinicalBlock } from '../../types/dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  data: ClinicalBlock;
}

const DEMO_PATIENTS = [
  { id: 'PT-00412', riskScore: 8, riskLevel: 'CRITICAL', factors: ['Hypotension (SBP 82 mmHg)', 'Elevated lactate (4.1 mmol/L)', 'Tachycardia (118 bpm)'], timeToDet: 'High risk within 2 hours', actions: ['Activate critical care response team', 'Vasopressor therapy if refractory hypotension', 'ICU/HDU transfer'] },
  { id: 'PT-00789', riskScore: 6, riskLevel: 'HIGH', factors: ['Hyperthermia (39.2C)', 'Tachypnea (RR 28)', 'ICU high-acuity setting'], timeToDet: 'High risk within 6 hours', actions: ['Initiate sepsis protocol', 'Broad-spectrum antibiotics within 1h', 'IV fluid resuscitation'] },
  { id: 'PT-01156', riskScore: 5, riskLevel: 'HIGH', factors: ['Leukocytosis (WBC 18.2)', 'Tachycardia (102 bpm)', 'Hyperthermia (38.6C)'], timeToDet: 'High risk within 6 hours', actions: ['Initiate sepsis protocol', 'Blood cultures x2', 'Reassess within 2h'] },
  { id: 'PT-00234', riskScore: 4, riskLevel: 'MODERATE', factors: ['Tachycardia (96 bpm)', 'Mild hyperthermia (38.2C)'], timeToDet: 'Monitor 12-24 hours', actions: ['Increase vital signs frequency to every 2h', 'Obtain blood cultures if suspected', 'Reassess in 4h'] },
  { id: 'PT-00567', riskScore: 3, riskLevel: 'MODERATE', factors: ['Tachypnea (RR 24)', 'ED care setting'], timeToDet: 'Monitor 12-24 hours', actions: ['Increase monitoring frequency', 'Review fluid balance', 'Reassess in 4-6h'] },
];

function getRiskColor(level: string): string {
  const map: Record<string, string> = { CRITICAL: '#ef4444', HIGH: '#f97316', MODERATE: '#f59e0b', LOW: '#14b8a6' };
  return map[level] ?? '#64748b';
}

export function HighRiskPatientsDrilldown({ open, onClose, data }: Props) {
  const patients = DEMO_PATIENTS.slice(0, Math.max(data.high_risk_patients, 1));

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="HIGH-RISK PATIENTS"
      subtitle={`${data.high_risk_patients} patients flagged by sepsis/deterioration models`}
      width="520px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {patients.map((pt) => (
          <div
            key={pt.id}
            style={{
              background: '#111820',
              border: `1px solid ${getRiskColor(pt.riskLevel)}20`,
              borderLeft: `3px solid ${getRiskColor(pt.riskLevel)}`,
              borderRadius: '4px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', fontFamily: "'JetBrains Mono', monospace" }}>
                  {pt.id}
                </span>
                <RiskBadge level={pt.riskLevel} size="sm" />
              </div>
              <Tooltip content="Composite risk score from sepsis/deterioration model">
                <span style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: getRiskColor(pt.riskLevel),
                  fontVariantNumeric: 'tabular-nums',
                  cursor: 'default',
                }}>
                  {pt.riskScore}
                </span>
              </Tooltip>
            </div>

            <Tooltip content="Estimated time window before clinical deterioration">
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: `${getRiskColor(pt.riskLevel)}10`,
                border: `1px solid ${getRiskColor(pt.riskLevel)}25`,
                borderRadius: '3px',
                padding: '2px 8px',
                marginBottom: '8px',
                cursor: 'default',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={getRiskColor(pt.riskLevel)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span style={{ fontSize: '9px', fontWeight: 600, color: getRiskColor(pt.riskLevel), letterSpacing: '0.04em' }}>
                  {pt.timeToDet}
                </span>
              </div>
            </Tooltip>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Triggered Factors
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {pt.factors.map((f, i) => (
                  <span key={i} style={{
                    fontSize: '9px',
                    color: '#8b9ab5',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    padding: '2px 6px',
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Recommended Actions
              </div>
              {pt.actions.map((a, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px',
                  padding: '3px 0',
                }}>
                  <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: getRiskColor(pt.riskLevel), flexShrink: 0, marginTop: '5px' }} />
                  <span style={{ fontSize: '10px', color: '#8b9ab5', lineHeight: 1.4 }}>{a}</span>
                </div>
              ))}
            </div>

            <button
              style={{
                width: '100%',
                padding: '6px',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '4px',
                color: '#3b82f6',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; }}
            >
              VIEW PATIENT RECORD
            </button>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}
