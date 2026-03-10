import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';
import type { ClinicalBlock } from '../../types/dashboard';

interface Props {
  data: ClinicalBlock;
  onHighRiskClick?: () => void;
  onAlertsClick?: () => void;
}

const ClinicalIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

function mockSparkline(seed: number) {
  const pts: { v: number }[] = [];
  let v = Math.max(0, seed - 4);
  for (let i = 0; i < 13; i++) {
    v = Math.max(0, v + (i % 3 === 0 ? 1 : -1) + (seed > 5 ? 1 : 0));
    pts.push({ v });
  }
  pts[pts.length - 1] = { v: seed };
  return pts;
}

const clickableStyle: React.CSSProperties = {
  cursor: 'pointer',
  borderRadius: '4px',
  transition: 'background 0.15s ease',
};

export function ClinicalCard({ data, onHighRiskClick, onAlertsClick }: Props) {
  const sparkData = mockSparkline(data.deterioration_alerts_24h);
  const hasAlerts = data.deterioration_alerts_24h > 0;
  const hasHighRisk = data.high_risk_patients > 0;

  return (
    <Card
      title="Clinical Risk Intelligence"
      subtitle="24h window"
      icon={<ClinicalIcon />}
      borderColor={hasHighRisk ? '#ef4444' : undefined}
      criticalPulse={hasHighRisk}
      guideId="clinical-card"
    >
      <div style={{ display: 'flex', gap: '0', marginBottom: '10px' }}>
        <Tooltip content="Click to view high-risk patients">
          <div
            style={{ ...clickableStyle, flex: 1, padding: '4px 10px 4px 4px', borderRight: '1px solid rgba(255,255,255,0.04)' }}
            onClick={onHighRiskClick}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>High-Risk Patients</div>
            <div style={{
              fontSize: '22px',
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
              color: hasHighRisk ? '#ef4444' : '#e2e8f0',
              lineHeight: 1,
              transition: 'color 0.3s ease',
            }}>
              {data.high_risk_patients}
            </div>
            <div style={{ fontSize: '8px', color: '#4e5f74', marginTop: '2px' }}>currently monitored</div>
          </div>
        </Tooltip>
        <Tooltip content="Click to view alert timeline">
          <div
            style={{ ...clickableStyle, flex: 1, padding: '4px 4px 4px 10px' }}
            onClick={onAlertsClick}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>Alerts</div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: hasAlerts ? '#ef4444' : '#e2e8f0',
                  lineHeight: 1,
                  transition: 'color 0.3s ease',
                }}>
                  {data.deterioration_alerts_24h}
                </div>
                <div style={{ fontSize: '8px', color: '#4e5f74', marginTop: '2px' }}>last 24h</div>
              </div>
              <div style={{ width: '48px', height: '26px', marginTop: '2px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke={hasAlerts ? '#ef4444' : '#3b82f6'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>

      {data.top_risk_factors.length > 0 ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '16px 1fr',
            gap: '0',
            paddingBottom: '3px',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            marginBottom: '2px',
          }}>
            <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em' }}>#</span>
            <span style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Risk Factor</span>
          </div>
          {data.top_risk_factors.map((factor, i) => (
            <div
              key={i}
              className="cmd-row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '16px 1fr 6px',
                alignItems: 'center',
                padding: '3px 0',
                borderBottom: '1px solid rgba(255,255,255,0.02)',
              }}
            >
              <span style={{ fontSize: '9px', color: '#4e5f74', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>
              <span style={{ fontSize: '10px', color: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#8b9ab5' }}>{factor}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : 'rgba(255,255,255,0.06)' }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: '10px', color: '#4e5f74', fontStyle: 'italic' }}>No active risk factors</div>
      )}
    </Card>
  );
}
