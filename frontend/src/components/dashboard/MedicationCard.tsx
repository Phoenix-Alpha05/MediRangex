import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';
import type { MedicationSafetyBlock } from '../../types/dashboard';

interface Props {
  data: MedicationSafetyBlock;
  onMedAlertsClick?: () => void;
}

const MedIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#f59e0b',
  LOW: '#14b8a6',
};

function getSeverityFromClass(cls: string): string {
  const up = cls.toUpperCase();
  if (up.includes('CRITICAL') || up.includes('CONTRA')) return 'CRITICAL';
  if (up.includes('HIGH') || up.includes('MAJOR')) return 'HIGH';
  if (up.includes('MODERATE') || up.includes('MED')) return 'MODERATE';
  return 'LOW';
}

const clickableStyle: React.CSSProperties = {
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'background 0.15s ease',
};

export function MedicationCard({ data, onMedAlertsClick }: Props) {
  const hasCritical = data.critical_alerts_24h > 0;
  const hasHighAlert = data.high_alert_med_admin_count > 0;

  return (
    <Card
      title="Medication Safety Surveillance"
      subtitle="24h window"
      icon={<MedIcon />}
      borderColor={hasCritical ? '#f59e0b' : undefined}
      criticalPulse={hasCritical}
    >
      <div
        style={{ display: 'flex', gap: '0', marginBottom: '10px', ...clickableStyle }}
        onClick={onMedAlertsClick}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <Tooltip content="Click to view medication safety details">
          <div style={{ flex: 1, paddingRight: '10px', borderRight: '1px solid rgba(255,255,255,0.04)', padding: '4px 10px 4px 4px' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Critical Alerts</div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              color: hasCritical ? '#ef4444' : '#e2e8f0',
              transition: 'color 0.3s ease',
            }}>
              {data.critical_alerts_24h}
            </div>
            <div style={{ fontSize: '8px', color: '#4e5f74', marginTop: '2px' }}>last 24h</div>
          </div>
        </Tooltip>
        <Tooltip content="Click to view high-alert medication details">
          <div style={{ flex: 1, paddingLeft: '10px', padding: '4px 4px 4px 10px' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>High-Alert Meds</div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              color: hasHighAlert ? '#f59e0b' : '#e2e8f0',
              transition: 'color 0.3s ease',
            }}>
              {data.high_alert_med_admin_count}
            </div>
            <div style={{ fontSize: '8px', color: '#4e5f74', marginTop: '2px' }}>administrations</div>
          </div>
        </Tooltip>
      </div>

      {data.top_interaction_classes.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 70px',
            gap: '0',
            paddingBottom: '3px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            marginBottom: '2px',
          }}>
            <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Class</span>
            <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'right' }}>Severity</span>
          </div>
          {data.top_interaction_classes.map((cls, i) => {
            const sev = getSeverityFromClass(cls);
            const col = SEV_COLORS[sev] ?? '#8b9ab5';
            return (
              <div
                key={i}
                className="cmd-row-hover"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 70px',
                  alignItems: 'center',
                  padding: '3px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                }}
                onClick={onMedAlertsClick}
              >
                <span style={{ fontSize: '10px', color: '#8b9ab5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cls}</span>
                <span style={{ fontSize: '8px', fontWeight: 700, color: col, textAlign: 'right', letterSpacing: '0.06em' }}>{sev}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ fontSize: '10px', color: '#4e5f74', fontStyle: 'italic' }}>No interaction classes flagged</div>
      )}
    </Card>
  );
}
