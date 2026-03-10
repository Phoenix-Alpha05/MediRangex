import type { CommandDashboardResponse } from '../types/dashboard';

const API_BASE = '/api/dashboard';

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

export async function fetchCommandDashboard(token: string): Promise<CommandDashboardResponse> {
  try {
    const res = await fetch(`${API_BASE}/command-center`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return { ...EMPTY_DASHBOARD, generated_at: new Date().toISOString() };
    }

    return await res.json();
  } catch {
    return { ...EMPTY_DASHBOARD, generated_at: new Date().toISOString() };
  }
}
