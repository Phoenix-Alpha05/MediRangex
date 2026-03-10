import { Modal } from '../ui/Modal';
import { RiskBadge } from '../ui/RiskBadge';
import { Tooltip } from '../ui/Tooltip';
import type { MedicationSafetyBlock } from '../../types/dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  data: MedicationSafetyBlock;
}

interface MedAlert {
  drugPair: string;
  severity: string;
  mechanism: string;
  clinicalRisk: string;
  recommendation: string;
  evidenceSource: string;
  interactionClass: string;
}

function generateMedAlerts(data: MedicationSafetyBlock): MedAlert[] {
  const alerts: MedAlert[] = [
    {
      drugPair: 'Warfarin + Ibuprofen',
      severity: 'CRITICAL',
      mechanism: 'GI hemorrhage risk via platelet inhibition and displacement of warfarin from protein binding',
      clinicalRisk: 'Major bleeding risk from additive anticoagulation',
      recommendation: 'Discontinue NSAID; use acetaminophen for analgesia; monitor INR closely',
      evidenceSource: 'guideline',
      interactionClass: 'PD',
    },
    {
      drugPair: 'Amiodarone + Haloperidol',
      severity: 'CRITICAL',
      mechanism: 'Additive QT prolongation from dual potassium channel blockade',
      clinicalRisk: 'Risk of Torsades de Pointes and fatal cardiac arrhythmia',
      recommendation: 'Continuous ECG monitoring; consider alternative antiarrhythmic or antipsychotic',
      evidenceSource: 'guideline',
      interactionClass: 'QT',
    },
    {
      drugPair: 'Gentamicin + Vancomycin',
      severity: 'HIGH',
      mechanism: 'Synergistic nephrotoxicity from dual aminoglycoside/glycopeptide renal tubular injury',
      clinicalRisk: 'Acute kidney injury and electrolyte dyscrasia',
      recommendation: 'Monitor renal function daily; adjust doses per eGFR; consider alternatives',
      evidenceSource: 'literature',
      interactionClass: 'PK',
    },
    {
      drugPair: 'Morphine + Midazolam',
      severity: 'HIGH',
      mechanism: 'Sedative stacking from multiple CNS depressants prescribed concurrently',
      clinicalRisk: 'Respiratory depression and oversedation',
      recommendation: 'Reduce doses; continuous pulse oximetry; have naloxone/flumazenil available',
      evidenceSource: 'guideline',
      interactionClass: 'PD',
    },
    {
      drugPair: 'Metformin (AKI patient)',
      severity: 'CRITICAL',
      mechanism: 'Contraindicated in acute kidney injury due to impaired renal clearance and lactic acidosis risk',
      clinicalRisk: 'Life-threatening lactic acidosis',
      recommendation: 'Withhold metformin until renal function stabilizes; switch to insulin',
      evidenceSource: 'guideline',
      interactionClass: 'PK',
    },
    {
      drugPair: 'Enoxaparin + Warfarin',
      severity: 'HIGH',
      mechanism: 'Dual anticoagulation from multiple anticoagulants prescribed concurrently',
      clinicalRisk: 'Major bleeding risk from additive anticoagulation',
      recommendation: 'Review and rationalise anticoagulant regimen; verify overlap is intentional during bridging',
      evidenceSource: 'guideline',
      interactionClass: 'PD',
    },
  ];

  return alerts.slice(0, Math.max(data.critical_alerts_24h + 2, 3));
}

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#f59e0b',
  LOW: '#14b8a6',
};

const CLASS_LABELS: Record<string, string> = {
  PD: 'Pharmacodynamic',
  PK: 'Pharmacokinetic',
  QT: 'QT Prolongation',
};

export function MedicationDrilldown({ open, onClose, data }: Props) {
  const alerts = generateMedAlerts(data);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="MEDICATION SAFETY ALERTS"
      subtitle={`${data.critical_alerts_24h} critical alerts | ${data.high_alert_med_admin_count} high-alert administrations`}
      maxWidth="800px"
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          flex: 1,
          background: '#111820',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Critical</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: data.critical_alerts_24h > 0 ? '#ef4444' : '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
            {data.critical_alerts_24h}
          </div>
        </div>
        <div style={{
          flex: 1,
          background: '#111820',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>High-Alert Meds</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: data.high_alert_med_admin_count > 0 ? '#f59e0b' : '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
            {data.high_alert_med_admin_count}
          </div>
        </div>
        <div style={{
          flex: 1,
          background: '#111820',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Interaction Classes</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>
            {data.top_interaction_classes.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.map((alert, idx) => {
          const sevColor = SEV_COLORS[alert.severity] ?? '#64748b';
          return (
            <div
              key={idx}
              style={{
                background: '#111820',
                border: `1px solid ${sevColor}15`,
                borderLeft: `3px solid ${sevColor}`,
                borderRadius: '4px',
                padding: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>{alert.drugPair}</span>
                  <RiskBadge level={alert.severity} size="sm" />
                </div>
                <Tooltip content={CLASS_LABELS[alert.interactionClass] ?? alert.interactionClass}>
                  <span style={{
                    fontSize: '8px',
                    fontWeight: 700,
                    color: '#3b82f6',
                    background: 'rgba(59,130,246,0.08)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: '3px',
                    padding: '2px 6px',
                    letterSpacing: '0.08em',
                    cursor: 'default',
                  }}>
                    {alert.interactionClass}
                  </span>
                </Tooltip>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Mechanism</div>
                  <div style={{ fontSize: '10px', color: '#8b9ab5', lineHeight: 1.5 }}>{alert.mechanism}</div>
                </div>
                <div>
                  <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Clinical Risk</div>
                  <div style={{ fontSize: '10px', color: sevColor, lineHeight: 1.5 }}>{alert.clinicalRisk}</div>
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>Recommendation</div>
                <div style={{ fontSize: '10px', color: '#8b9ab5', lineHeight: 1.5 }}>{alert.recommendation}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.06em' }}>EVIDENCE:</span>
                <span style={{
                  fontSize: '8px',
                  color: '#3b82f6',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}>
                  {alert.evidenceSource}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
