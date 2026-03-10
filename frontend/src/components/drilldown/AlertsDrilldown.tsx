import { Modal } from '../ui/Modal';
import { RiskBadge } from '../ui/RiskBadge';
import type { ClinicalBlock } from '../../types/dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  data: ClinicalBlock;
}

interface AlertEntry {
  id: string;
  type: string;
  timeDetected: string;
  status: 'active' | 'resolved';
  patientId: string;
  title: string;
  severity: string;
}

function generateAlerts(data: ClinicalBlock): AlertEntry[] {
  const count = data.deterioration_alerts_24h;
  if (count === 0) return [];

  const baseAlerts: AlertEntry[] = [
    { id: 'ALT-001', type: 'SEPSIS', timeDetected: '14:32', status: 'active', patientId: 'PT-00412', title: 'Sepsis screen positive - qSOFA >= 2', severity: 'CRITICAL' },
    { id: 'ALT-002', type: 'DETERIORATION', timeDetected: '13:18', status: 'active', patientId: 'PT-00789', title: 'Early warning score escalation (NEWS2 = 9)', severity: 'HIGH' },
    { id: 'ALT-003', type: 'CLINICAL_ALERT', timeDetected: '12:45', status: 'active', patientId: 'PT-01156', title: 'Sustained tachycardia >100 bpm for 2h', severity: 'HIGH' },
    { id: 'ALT-004', type: 'SEPSIS', timeDetected: '11:02', status: 'resolved', patientId: 'PT-00234', title: 'Lactate clearance protocol initiated', severity: 'MODERATE' },
    { id: 'ALT-005', type: 'DETERIORATION', timeDetected: '09:47', status: 'resolved', patientId: 'PT-00567', title: 'Respiratory rate trending upward', severity: 'MODERATE' },
    { id: 'ALT-006', type: 'CLINICAL_ALERT', timeDetected: '08:15', status: 'resolved', patientId: 'PT-00891', title: 'Hypotension episode (MAP < 65)', severity: 'HIGH' },
    { id: 'ALT-007', type: 'SEPSIS', timeDetected: '06:33', status: 'resolved', patientId: 'PT-00123', title: 'Blood culture positive - gram negative', severity: 'CRITICAL' },
    { id: 'ALT-008', type: 'DETERIORATION', timeDetected: '04:20', status: 'resolved', patientId: 'PT-00456', title: 'Oxygen saturation below 92%', severity: 'HIGH' },
  ];

  return baseAlerts.slice(0, Math.min(count, baseAlerts.length));
}

const TYPE_COLORS: Record<string, string> = {
  SEPSIS: '#ef4444',
  DETERIORATION: '#f97316',
  CLINICAL_ALERT: '#f59e0b',
};

export function AlertsDrilldown({ open, onClose, data }: Props) {
  const alerts = generateAlerts(data);
  const activeCount = alerts.filter(a => a.status === 'active').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="SEPSIS & DETERIORATION ALERTS"
      subtitle={`${data.deterioration_alerts_24h} alerts in the last 24 hours`}
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
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Active</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: activeCount > 0 ? '#ef4444' : '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{activeCount}</div>
        </div>
        <div style={{
          flex: 1,
          background: '#111820',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Resolved</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#14b8a6', fontVariantNumeric: 'tabular-nums' }}>{resolvedCount}</div>
        </div>
        <div style={{
          flex: 1,
          background: '#111820',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          padding: '10px 14px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Total 24h</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#e2e8f0', fontVariantNumeric: 'tabular-nums' }}>{data.deterioration_alerts_24h}</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '70px 90px 1fr 80px 70px 64px',
        gap: '0',
        padding: '6px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '2px',
      }}>
        {['Time', 'Type', 'Description', 'Patient', 'Severity', 'Status'].map(h => (
          <span key={h} style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {h}
          </span>
        ))}
      </div>

      {alerts.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#4e5f74', fontSize: '11px' }}>
          No alerts in the past 24 hours
        </div>
      )}

      {alerts.map((alert) => {
        const typeColor = TYPE_COLORS[alert.type] ?? '#64748b';
        return (
          <div
            key={alert.id}
            className="cmd-row-hover"
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 90px 1fr 80px 70px 64px',
              gap: '0',
              padding: '8px 10px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              alignItems: 'center',
              borderLeft: alert.status === 'active' ? `2px solid ${typeColor}` : '2px solid transparent',
            }}
          >
            <span style={{ fontSize: '11px', color: '#8b9ab5', fontVariantNumeric: 'tabular-nums', fontFamily: "'JetBrains Mono', monospace" }}>
              {alert.timeDetected}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '8px',
              fontWeight: 700,
              color: typeColor,
              letterSpacing: '0.06em',
            }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: typeColor, flexShrink: 0 }} />
              {alert.type.replace('_', ' ')}
            </span>
            <span style={{ fontSize: '10px', color: '#8b9ab5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
              {alert.title}
            </span>
            <span style={{ fontSize: '10px', color: '#3b82f6', fontFamily: "'JetBrains Mono', monospace" }}>
              {alert.patientId}
            </span>
            <RiskBadge level={alert.severity} size="xs" />
            <span style={{
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: alert.status === 'active' ? '#ef4444' : '#14b8a6',
            }}>
              {alert.status.toUpperCase()}
            </span>
          </div>
        );
      })}
    </Modal>
  );
}
