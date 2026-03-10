import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { RiskBadge } from '../ui/RiskBadge';
import { Tooltip } from '../ui/Tooltip';
import { getRiskColor } from '../../utils/statusColors';
import type { OperationsBlock } from '../../types/dashboard';

interface Props {
  data: OperationsBlock;
  onOpsRiskClick?: () => void;
}

const OpsIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8m-4-4v4" />
  </svg>
);

const DOMAIN_LABELS: [keyof OperationsBlock, string, string][] = [
  ['icu_capacity_risk',        'ICU',      'ICU bed capacity risk level'],
  ['total_bed_capacity_risk',  'BEDS',     'Total bed capacity risk level'],
  ['ventilator_capacity_risk', 'VENTS',    'Ventilator availability risk'],
  ['staffing_strain_risk',     'STAFFING', 'Nurse/staff strain risk'],
];

function mockTrend(level: string): { v: number }[] {
  const base = level === 'CRITICAL' ? 90 : level === 'HIGH' ? 75 : level === 'MODERATE' ? 55 : 35;
  return Array.from({ length: 10 }, (_, i) => ({
    v: Math.max(0, Math.min(100, base + Math.sin(i) * 6 + (i * 0.5))),
  }));
}

export function OperationsCard({ data, onOpsRiskClick }: Props) {
  const hasAlerts = data.surge_alerts.length > 0;

  return (
    <Card
      title="Hospital Capacity State"
      subtitle="Live"
      icon={<OpsIcon />}
      borderColor={hasAlerts ? '#ef4444' : undefined}
      guideId="operations-card"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '10px',
          cursor: 'pointer',
        }}
        onClick={onOpsRiskClick}
      >
        {DOMAIN_LABELS.map(([key, label, tip]) => {
          const level = String(data[key]);
          const trend = mockTrend(level);
          const col = getRiskColor(level);
          return (
            <Tooltip key={key} content={`${tip} - Click for details`}>
              <div
                style={{
                  background: '#0d1219',
                  padding: '6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  width: '100%',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#101720'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0d1219'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em' }}>{label}</span>
                  <RiskBadge level={level} size="xs" showDot={false} />
                </div>
                <div style={{ height: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trend}>
                      <Area type="monotone" dataKey="v" stroke={col} strokeWidth={1} fill={`${col}15`} dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>

      {hasAlerts ? (
        <div>
          <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
            Active Surge Alerts
          </div>
          {data.surge_alerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              marginBottom: '2px',
              background: 'rgba(239,68,68,0.06)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '3px',
              cursor: 'pointer',
            }}
            onClick={onOpsRiskClick}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />
              <span style={{ fontSize: '10px', color: '#ef4444' }}>{alert}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          background: 'rgba(20,184,166,0.04)',
          border: '1px solid rgba(20,184,166,0.12)',
          borderRadius: '3px',
        }}>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#14b8a6', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: '#14b8a6' }}>No active surge alerts</span>
        </div>
      )}
    </Card>
  );
}
