export interface SepsisRiskResponse {
  patient_id: string;
  risk_score_raw: number;
  risk_probability: number | null;
  risk_level: string;
  time_to_deterioration: string;
  triggered_factors: string[];
  clinical_rationale: string;
  recommended_actions: string[];
  engine_version: string;
  evaluated_at: string;
}

export interface AlertLogEntry {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  patient_id: string | null;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

export interface DrugAlert {
  type: string;
  severity: string;
  drugs: string[];
  mechanism: string;
  clinical_risk: string;
  interaction_class: string;
  confidence_level: string;
  evidence_source: string;
  recommendation: string;
  context_modifiers_applied: ContextModifier[];
}

export interface ContextModifier {
  trigger: string;
  threshold_description: string;
  affected_alert_types: string[];
  severity_escalated_to: string;
  rationale: string;
}

export interface DrugInteractionResponse {
  patient_id: string;
  alerts: DrugAlert[];
  summary: {
    total_alerts: number;
    critical: number;
    warnings: number;
  };
  recommended_actions: string[];
  engine_version: string;
  checked_at: string;
  context_flags: string[];
}

export interface OperationsRiskResponse {
  system_status: string;
  icu_capacity_risk: string;
  total_bed_capacity_risk: string;
  ed_congestion_risk: string;
  ventilator_capacity_risk: string;
  staffing_strain_risk: string;
  triggered_factors: string[];
  operational_alerts: string[];
  recommended_actions: string[];
  engine_version: string;
  evaluated_at: string;
}

export interface OccupancyForecast {
  point: number;
  ci: [number, number] | null;
}

export interface OperationsMLForecast {
  icu_occupancy_forecast_6h: OccupancyForecast;
  icu_occupancy_forecast_24h: OccupancyForecast;
  bed_occupancy_forecast_24h: OccupancyForecast;
  ed_congestion_risk_probability: number;
  staffing_overload_probability: number;
  confidence_level: string;
  model_version: string;
  model_type: string;
  predicted_at: string;
}
