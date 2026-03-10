import { useMemo } from 'react';
import { SlideOver } from '../ui/SlideOver';
import { RiskBadge } from '../ui/RiskBadge';
import { Tooltip } from '../ui/Tooltip';
import type { MLBlock } from '../../types/dashboard';

interface Props {
  open: boolean;
  onClose: () => void;
  data: MLBlock;
}

interface PredictionEntry {
  id: string;
  timestamp: string;
  patientId: string;
  modelVersion: string;
  riskLevel: string;
  confidence: number;
  predictionType: string;
  latencyMs: number;
}

const PREDICTION_TYPES = ['Sepsis Risk', 'Deterioration', 'Readmission', 'LOS Estimate', 'Mortality'];
const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

function generatePredictionLogs(count: number, modelVersion: string): PredictionEntry[] {
  const logs: PredictionEntry[] = [];
  const now = Date.now();
  for (let i = 0; i < Math.min(count, 20); i++) {
    const hoursAgo = (i / 20) * 24;
    const ts = new Date(now - hoursAgo * 3600_000);
    const riskIdx = i < 3 ? 3 : i < 7 ? 2 : i < 13 ? 1 : 0;
    logs.push({
      id: `PRED-${String(1000 + i).slice(1)}`,
      timestamp: ts.toISOString(),
      patientId: `PT-${String(2000 + (i * 7) % 50).slice(1)}`,
      modelVersion,
      riskLevel: RISK_LEVELS[riskIdx],
      confidence: 0.55 + (3 - riskIdx) * 0.1 + Math.sin(i) * 0.05,
      predictionType: PREDICTION_TYPES[i % PREDICTION_TYPES.length],
      latencyMs: 12 + Math.round(Math.sin(i * 1.3) * 8 + i * 0.5),
    });
  }
  return logs;
}

const CONF_COLORS: Record<string, string> = {
  LOW: '#f97316',
  MEDIUM: '#f59e0b',
  HIGH: '#14b8a6',
};

const TYPE_COLORS: Record<string, string> = {
  'Sepsis Risk': '#ef4444',
  'Deterioration': '#f97316',
  'Readmission': '#f59e0b',
  'LOS Estimate': '#3b82f6',
  'Mortality': '#ef4444',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MLPredictionsDrilldown({ open, onClose, data }: Props) {
  const logs = useMemo(
    () => generatePredictionLogs(data.predictions_last_24h, data.active_model_version),
    [data.predictions_last_24h, data.active_model_version],
  );

  const CONF_ORDER = ['LOW', 'MEDIUM', 'HIGH'];
  const total = CONF_ORDER.reduce((s, k) => s + (data.confidence_distribution[k] ?? 0), 0) || 1;

  return (
    <SlideOver open={open} onClose={onClose} title="AI Model Operations" subtitle="Prediction Logs & Performance" width="520px">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
        <Tooltip content="Currently deployed model version">
          <div style={{ background: '#0d1219', padding: '10px 12px', width: '100%' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Model</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#3b82f6', fontWeight: 700, marginTop: '2px' }}>
              v{data.active_model_version}
            </div>
          </div>
        </Tooltip>
        <Tooltip content="Total predictions executed in the last 24 hours">
          <div style={{ background: '#0d1219', padding: '10px 12px', width: '100%' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Predictions</div>
            <div style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 800, fontVariantNumeric: 'tabular-nums', marginTop: '2px' }}>
              {data.predictions_last_24h.toLocaleString()}
            </div>
          </div>
        </Tooltip>
        <Tooltip content={data.drift_detected ? 'Feature drift detected - model review recommended' : 'No drift detected - model is stable'}>
          <div style={{ background: '#0d1219', padding: '10px 12px', width: '100%' }}>
            <div style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', fontWeight: 700, textTransform: 'uppercase' }}>Drift Status</div>
            <div style={{ marginTop: '4px' }}>
              {data.drift_detected ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease-in-out infinite' }} />
                  DRIFT
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#14b8a6', letterSpacing: '0.06em' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#14b8a6' }} />
                  STABLE
                </span>
              )}
            </div>
          </div>
        </Tooltip>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '9px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Confidence Distribution
        </div>
        {CONF_ORDER.map((key) => {
          const count = data.confidence_distribution[key] ?? 0;
          const pct = (count / total) * 100;
          const col = CONF_COLORS[key] ?? '#8b9ab5';
          return (
            <div key={key} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: col, letterSpacing: '0.06em' }}>{key}</span>
                <span style={{ fontSize: '9px', color: '#4e5f74', fontVariantNumeric: 'tabular-nums' }}>{count.toLocaleString()} ({pct.toFixed(1)}%)</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: col, borderRadius: '2px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div style={{ fontSize: '9px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Recent Predictions ({logs.length} shown)
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px 50px 1fr 60px 50px 40px',
          gap: '0',
          paddingBottom: '4px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          marginBottom: '2px',
        }}>
          {['Time', 'Patient', 'Type', 'Risk', 'Conf', 'ms'].map(h => (
            <span key={h} style={{ fontSize: '7px', color: '#4e5f74', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {logs.map((log) => (
          <div
            key={log.id}
            className="cmd-row-hover"
            style={{
              display: 'grid',
              gridTemplateColumns: '52px 50px 1fr 60px 50px 40px',
              alignItems: 'center',
              padding: '5px 0',
              borderBottom: '1px solid rgba(255,255,255,0.02)',
              borderLeft: log.riskLevel === 'CRITICAL' ? '2px solid #ef4444' : log.riskLevel === 'HIGH' ? '2px solid #f97316' : '2px solid transparent',
              paddingLeft: '4px',
            }}
          >
            <span style={{ fontSize: '9px', color: '#64748b', fontVariantNumeric: 'tabular-nums', fontFamily: "'JetBrains Mono', monospace" }}>
              {formatTime(log.timestamp)}
            </span>
            <span style={{ fontSize: '9px', color: '#8b9ab5', fontFamily: "'JetBrains Mono', monospace" }}>
              {log.patientId}
            </span>
            <span style={{ fontSize: '9px', color: TYPE_COLORS[log.predictionType] ?? '#8b9ab5', fontWeight: 600 }}>
              {log.predictionType}
            </span>
            <RiskBadge level={log.riskLevel} size="xs" />
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              color: log.confidence >= 0.8 ? '#14b8a6' : log.confidence >= 0.6 ? '#f59e0b' : '#f97316',
            }}>
              {(log.confidence * 100).toFixed(0)}%
            </span>
            <span style={{
              fontSize: '8px',
              fontVariantNumeric: 'tabular-nums',
              fontFamily: "'JetBrains Mono', monospace",
              color: log.latencyMs > 20 ? '#f59e0b' : '#4e5f74',
            }}>
              {log.latencyMs}ms
            </span>
          </div>
        ))}
      </div>
    </SlideOver>
  );
}
