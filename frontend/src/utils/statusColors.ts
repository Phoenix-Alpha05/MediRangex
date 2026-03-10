export type SystemStatus = 'NORMAL' | 'STRAINED' | 'SURGE' | 'UNKNOWN' | 'LIVE';
export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

interface StatusTheme {
  color: string;
  bg: string;
  border: string;
  pulse: boolean;
}

const STATUS_THEMES: Record<SystemStatus, StatusTheme> = {
  LIVE:     { color: '#14b8a6', bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', pulse: true },
  NORMAL:   { color: '#14b8a6', bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', pulse: false },
  STRAINED: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', pulse: false },
  SURGE:    { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',  pulse: true },
  UNKNOWN:  { color: '#64748b', bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.2)', pulse: false },
};

export function resolveDisplayStatus(raw: string): SystemStatus {
  const upper = raw?.toUpperCase() ?? 'UNKNOWN';
  if (upper === 'UNKNOWN') return 'UNKNOWN';
  return 'LIVE';
}

export function getStatusTheme(status: string): StatusTheme {
  return STATUS_THEMES[(status?.toUpperCase() ?? 'UNKNOWN') as SystemStatus] ?? STATUS_THEMES.UNKNOWN;
}

const RISK_COLORS: Record<string, string> = {
  LOW: '#14b8a6',
  MODERATE: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
  UNKNOWN: '#64748b',
};

export function getRiskColor(level: string): string {
  return RISK_COLORS[level?.toUpperCase()] ?? RISK_COLORS.UNKNOWN;
}

export function kpiColor(val: number, warn = 70, crit = 85): string {
  if (val >= crit) return '#ef4444';
  if (val >= warn) return '#f97316';
  return '#e2e8f0';
}
