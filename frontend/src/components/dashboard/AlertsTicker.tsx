import { useMemo } from 'react';
import type { ClinicalBlock, MedicationSafetyBlock } from '../../types/dashboard';

interface Props {
  clinical: ClinicalBlock;
  medication: MedicationSafetyBlock;
}

interface TickerItem {
  label: string;
  color: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
}

function buildTickerItems(clinical: ClinicalBlock, medication: MedicationSafetyBlock): TickerItem[] {
  const items: TickerItem[] = [];

  if (clinical.high_risk_patients > 0) {
    items.push({
      label: `${clinical.high_risk_patients} HIGH-RISK PATIENTS UNDER MONITORING`,
      color: '#ef4444',
      severity: 'CRITICAL',
    });
  }

  if (clinical.deterioration_alerts_24h > 0) {
    items.push({
      label: `${clinical.deterioration_alerts_24h} DETERIORATION ALERTS IN 24H`,
      color: '#f97316',
      severity: 'WARNING',
    });
  }

  if (medication.critical_alerts_24h > 0) {
    items.push({
      label: `${medication.critical_alerts_24h} CRITICAL MEDICATION ALERTS`,
      color: '#ef4444',
      severity: 'CRITICAL',
    });
  }

  if (medication.high_alert_med_admin_count > 0) {
    items.push({
      label: `${medication.high_alert_med_admin_count} HIGH-ALERT MED ADMINISTRATIONS`,
      color: '#f59e0b',
      severity: 'WARNING',
    });
  }

  clinical.top_risk_factors.slice(0, 2).forEach(factor => {
    items.push({
      label: `RISK FACTOR: ${factor.toUpperCase()}`,
      color: '#f97316',
      severity: 'WARNING',
    });
  });

  return items;
}

const SEV_ICON: Record<string, string> = {
  CRITICAL: '\u26a0',
  WARNING: '\u25cf',
  INFO: '\u2139',
};

export function AlertsTicker({ clinical, medication }: Props) {
  const items = useMemo(() => buildTickerItems(clinical, medication), [clinical, medication]);

  if (items.length === 0) return null;

  const hasCritical = items.some(i => i.severity === 'CRITICAL');
  const repeated = [...items, ...items];
  const duration = Math.max(items.length * 6, 18);

  return (
    <div
      style={{
        height: '26px',
        background: hasCritical ? 'rgba(239,68,68,0.04)' : 'rgba(245,158,11,0.03)',
        borderBottom: `1px solid ${hasCritical ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.12)'}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '90px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '12px',
          gap: '5px',
          background: hasCritical
            ? 'linear-gradient(90deg, rgba(239,68,68,0.08) 70%, transparent)'
            : 'linear-gradient(90deg, rgba(245,158,11,0.06) 70%, transparent)',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: hasCritical ? '#ef4444' : '#f59e0b',
            animation: 'pulse 1.2s ease-in-out infinite',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '8px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: hasCritical ? '#ef4444' : '#f59e0b',
            whiteSpace: 'nowrap',
          }}
        >
          ALERTS
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          animation: `ticker-scroll ${duration}s linear infinite`,
          paddingLeft: '96px',
        }}
      >
        {repeated.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              marginRight: '40px',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: item.color,
            }}
          >
            <span style={{ fontSize: '8px' }}>{SEV_ICON[item.severity]}</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
