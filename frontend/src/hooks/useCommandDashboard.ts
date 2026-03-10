import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchCommandDashboard } from '../api/dashboard';
import type { CommandDashboardResponse } from '../types/dashboard';

const REFRESH_INTERVAL_MS = 30_000;

export interface DashboardState {
  data: CommandDashboardResponse | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  latencyMs: number | null;
  refresh: () => void;
}

export function useCommandDashboard(token: string): DashboardState {
  const [data, setData] = useState<CommandDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const visibleRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const result = await fetchCommandDashboard(token);
      setLatencyMs(Math.round(performance.now() - start));
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setLatencyMs(Math.round(performance.now() - start));
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (visibleRef.current) load();
    }, REFRESH_INTERVAL_MS);
  }, [load]);

  useEffect(() => {
    load();
    startPolling();

    const handleVisibility = () => {
      visibleRef.current = document.visibilityState === 'visible';
      if (visibleRef.current) {
        load();
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [load, startPolling]);

  return { data, loading, error, lastUpdated, latencyMs, refresh: load };
}
