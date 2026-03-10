import { useCallback, useEffect, useState } from 'react';
import { ClinicalCard } from '../components/dashboard/ClinicalCard';
import { MLCard } from '../components/dashboard/MLCard';
import { MedicationCard } from '../components/dashboard/MedicationCard';
import { OperationsCard } from '../components/dashboard/OperationsCard';
import { SystemStatusBar } from '../components/dashboard/SystemStatusBar';
import { AlertsTicker } from '../components/dashboard/AlertsTicker';
import { FooterStrip } from '../components/dashboard/FooterStrip';
import { ErrorToast } from '../components/ui/ErrorToast';
import { CardSkeleton } from '../components/ui/Skeleton';
import { HighRiskPatientsDrilldown } from '../components/drilldown/HighRiskPatientsDrilldown';
import { AlertsDrilldown } from '../components/drilldown/AlertsDrilldown';
import { MedicationDrilldown } from '../components/drilldown/MedicationDrilldown';
import { OperationsRiskDrilldown } from '../components/drilldown/OperationsRiskDrilldown';
import { MLPredictionsDrilldown } from '../components/drilldown/MLPredictionsDrilldown';
import { useCommandDashboard } from '../hooks/useCommandDashboard';

const DEMO_TOKEN = 'demo';

type DrilldownView = 'highRisk' | 'alerts' | 'medication' | 'operations' | 'ml' | null;

export function CommandCenter() {
  const { data, loading, error, lastUpdated, latencyMs, refresh } = useCommandDashboard(DEMO_TOKEN);
  const showSkeleton = loading && !data;
  const [toastDismissed, setToastDismissed] = useState(false);
  const [activeView, setActiveView] = useState<DrilldownView>(null);

  useEffect(() => {
    if (error) setToastDismissed(false);
  }, [error]);

  const handleRetry = useCallback(() => {
    setToastDismissed(false);
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        refresh();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [refresh]);

  const closeDrilldown = useCallback(() => setActiveView(null), []);

  if (error && !data) {
    return (
      <div style={{ padding: 40, color: '#ef4444', fontFamily: 'monospace', background: '#0a0e17', minHeight: '100vh' }}>
        <h2 style={{ fontSize: '14px', letterSpacing: '0.1em', fontWeight: 700 }}>DASHBOARD ERROR</h2>
        <pre style={{ fontSize: '11px', color: '#8b9ab5', marginTop: '8px' }}>{String(error)}</pre>
        <button
          onClick={refresh}
          style={{
            marginTop: 16,
            padding: '6px 14px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 4,
            color: '#ef4444',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: '11px',
            letterSpacing: '0.06em',
          }}
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#0a0e17',
    }}>
      <ErrorToast
        message={data && error && !toastDismissed ? error : null}
        onRetry={handleRetry}
        onDismiss={() => setToastDismissed(true)}
      />

      {data && (
        <SystemStatusBar
          data={data.system_status}
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
        />
      )}

      {data && (
        <AlertsTicker
          clinical={data.clinical}
          medication={data.medication_safety}
        />
      )}

      {!data && showSkeleton && (
        <div style={{
          height: '44px',
          background: '#0d1219',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          flexShrink: 0,
        }} />
      )}

      {showSkeleton && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '1px',
          flex: 1,
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}>
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      )}

      {data && (
        <div
          data-guide="dashboard"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '1px',
            flex: 1,
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
            minHeight: 0,
          }}>
          <ClinicalCard
            data={data.clinical}
            onHighRiskClick={() => setActiveView('highRisk')}
            onAlertsClick={() => setActiveView('alerts')}
          />
          <OperationsCard
            data={data.operations}
            onOpsRiskClick={() => setActiveView('operations')}
          />
          <MedicationCard
            data={data.medication_safety}
            onMedAlertsClick={() => setActiveView('medication')}
          />
          <MLCard data={data.ml} onMLClick={() => setActiveView('ml')} />
        </div>
      )}

      <FooterStrip lastUpdated={lastUpdated} latencyMs={latencyMs} />

      {data && (
        <>
          <HighRiskPatientsDrilldown
            open={activeView === 'highRisk'}
            onClose={closeDrilldown}
            data={data.clinical}
          />
          <AlertsDrilldown
            open={activeView === 'alerts'}
            onClose={closeDrilldown}
            data={data.clinical}
          />
          <MedicationDrilldown
            open={activeView === 'medication'}
            onClose={closeDrilldown}
            data={data.medication_safety}
          />
          <OperationsRiskDrilldown
            open={activeView === 'operations'}
            onClose={closeDrilldown}
            operations={data.operations}
            systemStatus={data.system_status}
          />
          <MLPredictionsDrilldown
            open={activeView === 'ml'}
            onClose={closeDrilldown}
            data={data.ml}
          />
        </>
      )}
    </div>
  );
}
