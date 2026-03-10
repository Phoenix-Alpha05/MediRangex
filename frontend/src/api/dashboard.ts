import type { CommandDashboardResponse } from '../types/dashboard';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const EMPTY_DASHBOARD: CommandDashboardResponse = {
  system_status: {
    system_status: 'UNKNOWN',
    icu_occupancy_6h: 0,
    icu_occupancy_24h: 0,
    total_bed_occupancy_24h: 0,
    ed_congestion_probability: 0,
    staffing_overload_probability: 0,
  },
  clinical: {
    high_risk_patients: 0,
    deterioration_alerts_24h: 0,
    top_risk_factors: [],
  },
  medication_safety: {
    critical_alerts_24h: 0,
    high_alert_med_admin_count: 0,
    top_interaction_classes: [],
  },
  operations: {
    icu_capacity_risk: 'UNKNOWN',
    total_bed_capacity_risk: 'UNKNOWN',
    ventilator_capacity_risk: 'UNKNOWN',
    staffing_strain_risk: 'UNKNOWN',
    surge_alerts: [],
  },
  ml: {
    active_model_version: '0.0.0',
    predictions_last_24h: 0,
    drift_detected: false,
    confidence_distribution: { LOW: 0, MEDIUM: 0, HIGH: 0 },
  },
  generated_at: new Date().toISOString(),
};

export async function fetchCommandDashboard(_token: string): Promise<CommandDashboardResponse> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/functions/v1/medirx-api`,
      {
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.ok) {
      return { ...EMPTY_DASHBOARD, generated_at: new Date().toISOString() };
    }

    return await res.json();
  } catch {
    return { ...EMPTY_DASHBOARD, generated_at: new Date().toISOString() };
  }
}
