import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { SystemStatusBlock } from '../../types/dashboard';
import { Tooltip } from '../ui/Tooltip';
import { getStatusTheme, kpiColor, resolveDisplayStatus } from '../../utils/statusColors';

interface Props {
  data: SystemStatusBlock;
  loading: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
}

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <span
      style={{
        fontSize: '13px',
        fontWeight: 700,
        color: '#e2e8f0',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.04em',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

function TrendArrow({ current, previous }: { current: number; previous: number | null }) {
  if (previous === null || Math.abs(current - previous) < 0.3) return null;
  const up = current > previous;
  return (
    <span
      style={{
        fontSize: '9px',
        fontWeight: 800,
        color: up ? '#ef4444' : '#14b8a6',
        marginLeft: '2px',
        lineHeight: 1,
        transition: 'color 0.3s ease',
      }}
    >
      {up ? '\u2191' : '\u2193'}
    </span>
  );
}

interface KpiProps {
  label: string;
  value: string;
  tip: string;
  color?: string;
  numericValue: number;
  previousValue: number | null;
  showTrend?: boolean;
}

function Kpi({ label, value, tip, color = '#e2e8f0', numericValue, previousValue, showTrend }: KpiProps) {
  const [flash, setFlash] = useState(false);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current !== null && prevRef.current !== numericValue) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
    prevRef.current = numericValue;
  }, [numericValue]);

  useEffect(() => {
    prevRef.current = numericValue;
  }, [numericValue]);

  return (
    <Tooltip content={tip}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 12px',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
          gap: '1px',
          cursor: 'default',
        }}
      >
        <span style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
          {label}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '0.02em',
            transition: 'color 0.3s ease',
            animation: flash ? 'kpi-flash 0.6s ease' : 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          {value}
          {showTrend && <TrendArrow current={numericValue} previous={previousValue} />}
        </span>
      </div>
    </Tooltip>
  );
}

export function SystemStatusBar({ data, loading, onRefresh }: Props) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const displayStatus = resolveDisplayStatus(data.system_status);
  const theme = getStatusTheme(displayStatus);

  const icu = data.icu_occupancy_6h;
  const beds = data.total_bed_occupancy_24h;
  const ed = data.ed_congestion_probability * 100;
  const staff = data.staffing_overload_probability * 100;

  const prevRef = useRef<{ icu: number; beds: number; ed: number; staff: number } | null>(null);
  const prev = prevRef.current;

  useEffect(() => {
    prevRef.current = { icu, beds, ed, staff };
  }, [icu, beds, ed, staff]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? 'auto' : '44px',
        minHeight: isMobile ? '40px' : undefined,
        flexWrap: isMobile ? 'wrap' : undefined,
        background: '#0d1219',
        borderBottom: `1px solid ${theme.border}`,
        padding: isMobile ? '6px 10px' : '0 16px',
        flexShrink: 0,
        gap: '8px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <Tooltip content="Back to home">
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '4px',
              padding: '4px 6px',
              cursor: 'pointer',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.15s, color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#3b82f6'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </Tooltip>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '20px', height: '20px', background: '#3b82f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#e8ecf4', letterSpacing: '0.04em', lineHeight: 1 }}>MediRangeX</span>
            {!isMobile && <span style={{ fontSize: '8px', color: '#4e5f74', letterSpacing: '0.08em', lineHeight: 1.2 }}>HOSPITAL INTELLIGENCE COMMAND CENTER</span>}
          </div>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.06)' }} />

        <Tooltip content={displayStatus === 'LIVE' ? 'System is live and receiving data' : `System is ${data.system_status}`}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '4px',
              background: theme.bg,
              border: `1px solid ${theme.border}`,
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: theme.color,
                flexShrink: 0,
                animation: theme.pulse ? 'live-dot 1.5s ease-in-out infinite' : 'none',
              }}
            />
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: theme.color }}>
              {displayStatus}
            </span>
          </div>
        </Tooltip>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Kpi label="ICU 6h" value={`${icu.toFixed(1)}%`} tip="ICU occupancy forecast (6-hour)" color={kpiColor(icu)} numericValue={icu} previousValue={prev?.icu ?? null} showTrend />
        <Kpi label="Beds 24h" value={`${beds.toFixed(1)}%`} tip="Total bed occupancy forecast (24-hour)" color={kpiColor(beds)} numericValue={beds} previousValue={prev?.beds ?? null} showTrend />
        <Kpi label="ED Risk" value={`${ed.toFixed(0)}%`} tip="ED congestion probability" color={kpiColor(ed, 50, 70)} numericValue={ed} previousValue={prev?.ed ?? null} />
        <Kpi label="Staff" value={`${staff.toFixed(0)}%`} tip="Staffing overload probability" color={kpiColor(staff)} numericValue={staff} previousValue={prev?.staff ?? null} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <LiveClock />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            borderRadius: '3px',
            background: 'rgba(59,130,246,0.08)',
            border: '1px solid rgba(59,130,246,0.15)',
          }}
        >
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#3b82f6', letterSpacing: '0.06em' }}>CLINICIAN</span>
        </div>

        {loading && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#3b82f6' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 1s ease-in-out infinite' }} />
            SYNC
          </span>
        )}

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Refresh (R)"
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '4px',
            padding: '3px 6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: loading ? '#4e5f74' : '#64748b',
            display: 'flex',
            alignItems: 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLButtonElement).style.color = '#3b82f6'; } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = loading ? '#4e5f74' : '#64748b'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
