import { Area, AreaChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis } from 'recharts';
import { SlideOver } from '../ui/SlideOver';
import { RiskBadge } from '../ui/RiskBadge';
import { Tooltip } from '../ui/Tooltip';
import { getRiskColor } from '../../utils/statusColors';
import type { OperationsBlock, SystemStatusBlock } from '../../types/dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  operations: OperationsBlock;
  systemStatus: SystemStatusBlock;
}

interface ForecastPoint {
  label: string;
  value: number;
  lower: number;
  upper: number;
}

function generateForecast(current: number, riskLevel: string): ForecastPoint[] {
  const drift = riskLevel === 'CRITICAL' ? 1.5 : riskLevel === 'HIGH' ? 0.8 : riskLevel === 'MODERATE' ? 0.3 : -0.2;
  const points: ForecastPoint[] = [];
  let val = current;
  for (let h = 0; h <= 24; h += 3) {
    const label = h === 0 ? 'Now' : `+${h}h`;
    const noise = Math.sin(h * 0.5) * 2;
    val = Math.min(100, Math.max(0, val + drift + noise));
    points.push({
      label,
      value: Math.round(val * 10) / 10,
      lower: Math.round(Math.max(0, val - 5 - Math.random() * 3) * 10) / 10,
      upper: Math.round(Math.min(100, val + 5 + Math.random() * 3) * 10) / 10,
    });
  }
  return points;
}

const DOMAIN_CONFIG: { key: keyof OperationsBlock; label: string; fullLabel: string; forecastBase: (ss: SystemStatusBlock) => number }[] = [
  { key: 'icu_capacity_risk', label: 'ICU', fullLabel: 'ICU Bed Capacity', forecastBase: (ss) => ss.icu_occupancy_6h },
  { key: 'total_bed_capacity_risk', label: 'BEDS', fullLabel: 'Total Bed Capacity', forecastBase: (ss) => ss.total_bed_occupancy_24h },
  { key: 'ventilator_capacity_risk', label: 'VENTS', fullLabel: 'Ventilator Availability', forecastBase: () => 65 },
  { key: 'staffing_strain_risk', label: 'STAFF', fullLabel: 'Staffing Strain', forecastBase: (ss) => ss.staffing_overload_probability * 100 },
];

export function OperationsRiskDrilldown({ open, onClose, operations, systemStatus }: Props) {
  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title="OPERATIONS RISK DETAIL"
      subtitle="Capacity forecasts and triggered alerts"
      width="560px"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {DOMAIN_CONFIG.map(({ key, label, fullLabel, forecastBase }) => {
          const level = String(operations[key]);
          const color = getRiskColor(level);
          const base = forecastBase(systemStatus);
          const forecast = generateForecast(base, level);
          return (
            <div key={key} style={{
              background: '#111820',
              border: `1px solid ${color}15`,
              borderRadius: '4px',
              padding: '10px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <Tooltip content={fullLabel}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#8b9ab5', letterSpacing: '0.1em', cursor: 'default' }}>{label}</span>
                </Tooltip>
                <RiskBadge level={level} size="xs" />
              </div>
              <div style={{ height: '64px', marginBottom: '4px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#4e5f74' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Area type="monotone" dataKey="upper" stroke="none" fill={`${color}08`} isAnimationActive={false} />
                    <Area type="monotone" dataKey="lower" stroke="none" fill="#0d1219" isAnimationActive={false} />
                    <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`${color}10`} dot={false} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ fontSize: '8px', color: '#4e5f74', textAlign: 'center' }}>
                Current: <span style={{ color, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{base.toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        background: '#111820',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '4px',
        padding: '10px 12px',
        marginBottom: '12px',
      }}>
        <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Probability Indicators
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <Tooltip content="Probability of ED becoming congested based on current patient flow">
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '9px', color: '#8b9ab5' }}>ED Congestion</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: systemStatus.ed_congestion_probability > 0.7 ? '#ef4444' : systemStatus.ed_congestion_probability > 0.4 ? '#f59e0b' : '#14b8a6',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {(systemStatus.ed_congestion_probability * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${systemStatus.ed_congestion_probability * 100}%`,
                  background: systemStatus.ed_congestion_probability > 0.7 ? '#ef4444' : systemStatus.ed_congestion_probability > 0.4 ? '#f59e0b' : '#14b8a6',
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </Tooltip>
          <Tooltip content="Probability of staffing levels becoming insufficient for patient load">
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ fontSize: '9px', color: '#8b9ab5' }}>Staffing Overload</span>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: systemStatus.staffing_overload_probability > 0.7 ? '#ef4444' : systemStatus.staffing_overload_probability > 0.4 ? '#f59e0b' : '#14b8a6',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {(systemStatus.staffing_overload_probability * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${systemStatus.staffing_overload_probability * 100}%`,
                  background: systemStatus.staffing_overload_probability > 0.7 ? '#ef4444' : systemStatus.staffing_overload_probability > 0.4 ? '#f59e0b' : '#14b8a6',
                  borderRadius: '2px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          </Tooltip>
        </div>
      </div>

      {operations.surge_alerts.length > 0 && (
        <div style={{
          background: '#111820',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: '4px',
          padding: '10px 12px',
          marginBottom: '12px',
        }}>
          <div style={{ fontSize: '8px', color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Triggered Operational Alerts
          </div>
          {operations.surge_alerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 8px',
              marginBottom: '3px',
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.12)',
              borderRadius: '3px',
            }}>
              <span style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: '#ef4444',
                flexShrink: 0,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '10px', color: '#ef4444' }}>{alert}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: '#111820',
        border: '1px solid rgba(255,255,255,0.04)',
        borderRadius: '4px',
        padding: '10px 12px',
      }}>
        <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
          Recommended Actions
        </div>
        {getRecommendedActions(operations).map((action, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
            padding: '4px 0',
            borderBottom: '1px solid rgba(255,255,255,0.02)',
          }}>
            <span style={{ fontSize: '9px', color: '#4e5f74', fontVariantNumeric: 'tabular-nums', flexShrink: 0, width: '14px', textAlign: 'right' }}>{i + 1}.</span>
            <span style={{ fontSize: '10px', color: '#8b9ab5', lineHeight: 1.4 }}>{action}</span>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}

function getRecommendedActions(ops: OperationsBlock): string[] {
  const actions: string[] = [];
  const criticals = [ops.icu_capacity_risk, ops.total_bed_capacity_risk, ops.ventilator_capacity_risk, ops.staffing_strain_risk];
  if (criticals.some(r => r === 'CRITICAL' || r === 'HIGH')) {
    actions.push('Activate surge capacity protocol');
  }
  if (ops.icu_capacity_risk === 'CRITICAL' || ops.icu_capacity_risk === 'HIGH') {
    actions.push('Open ICU overflow beds');
    actions.push('Initiate inter-hospital transfers for stable ICU patients');
  }
  if (ops.total_bed_capacity_risk === 'CRITICAL' || ops.total_bed_capacity_risk === 'HIGH') {
    actions.push('Defer elective surgeries');
    actions.push('Expedite discharge planning for eligible patients');
  }
  if (ops.staffing_strain_risk === 'CRITICAL' || ops.staffing_strain_risk === 'HIGH') {
    actions.push('Call backup staffing pool');
    actions.push('Redistribute nursing assignments across units');
  }
  if (ops.ventilator_capacity_risk === 'CRITICAL' || ops.ventilator_capacity_risk === 'HIGH') {
    actions.push('Review ventilator weaning protocols');
    actions.push('Coordinate with respiratory therapy for equipment reallocation');
  }
  if (actions.length === 0) {
    actions.push('Continue standard monitoring protocols');
    actions.push('Review pending discharges and bed availability');
  }
  return actions;
}
