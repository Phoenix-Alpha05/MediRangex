import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';
import { Tooltip } from '../ui/Tooltip';
import type { MLBlock } from '../../types/dashboard';

interface Props {
  data: MLBlock;
  onMLClick?: () => void;
}

const MLIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3m0 14v3M2 12h3m14 0h3m-3.5-6.5-2.1 2.1M8.6 15.4l-2.1 2.1M18.5 18.5l-2.1-2.1M8.6 8.6 6.5 6.5" />
  </svg>
);

const CONF_ORDER = ['LOW', 'MEDIUM', 'HIGH'];
const CONF_COLORS: Record<string, string> = {
  LOW: '#f97316',
  MEDIUM: '#f59e0b',
  HIGH: '#14b8a6',
};

function mockPredSparkline(count: number): { v: number }[] {
  return Array.from({ length: 14 }, (_, i) => ({
    v: Math.max(0, Math.round(count / 14) + Math.sin(i * 0.8) * Math.round(count * 0.05)),
  }));
}

export function MLCard({ data, onMLClick }: Props) {
  const total = CONF_ORDER.reduce((s, k) => s + (data.confidence_distribution[k] ?? 0), 0) || 1;
  const sparkData = mockPredSparkline(data.predictions_last_24h);

  return (
    <Card
      title="AI Model Operations"
      subtitle={`v${data.active_model_version}`}
      icon={<MLIcon />}
      borderColor={data.drift_detected ? '#ef4444' : undefined}
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
        onClick={onMLClick}
      >
        <Tooltip content="Currently deployed model version">
          <div style={{ background: '#0d1219', padding: '6px 8px', width: '100%' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Model</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: '#3b82f6', fontWeight: 600, marginTop: '1px' }}>
              {data.active_model_version}
            </div>
          </div>
        </Tooltip>
        <Tooltip content={data.drift_detected ? 'Feature drift has been detected - review recommended' : 'No feature drift detected'}>
          <div style={{ background: '#0d1219', padding: '6px 8px', width: '100%' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Drift</div>
            <div style={{ marginTop: '2px' }}>
              {data.drift_detected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite' }} />
                  DRIFT
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#14b8a6', letterSpacing: '0.06em' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#14b8a6' }} />
                  STABLE
                </span>
              )}
            </div>
          </div>
        </Tooltip>
        <Tooltip content="Total model predictions in the last 24 hours">
          <div style={{ background: '#0d1219', padding: '6px 8px', gridColumn: 'span 2', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Predictions 24h</div>
                <div style={{ fontSize: '18px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#e2e8f0', lineHeight: 1, transition: 'color 0.3s ease' }}>
                  {data.predictions_last_24h.toLocaleString()}
                </div>
              </div>
              <div style={{ width: '56px', height: '24px', flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>

      <div>
        <div style={{ fontSize: '8px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '5px' }}>
          Confidence Distribution
        </div>
        {CONF_ORDER.map((key) => {
          const count = data.confidence_distribution[key] ?? 0;
          const pct = (count / total) * 100;
          const col = CONF_COLORS[key] ?? '#8b9ab5';
          return (
            <Tooltip key={key} content={`${key}: ${count.toLocaleString()} predictions (${pct.toFixed(1)}%)`}>
              <div style={{ marginBottom: '4px', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: col, letterSpacing: '0.08em' }}>{key}</span>
                  <span style={{ fontSize: '8px', color: '#4e5f74', fontVariantNumeric: 'tabular-nums' }}>
                    {count.toLocaleString()} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: col,
                      borderRadius: '2px',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
