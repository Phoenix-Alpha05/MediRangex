export interface SystemStatusBlock {
  system_status: 'NORMAL' | 'STRAINED' | 'SURGE' | 'UNKNOWN';
  icu_occupancy_6h: number;
  icu_occupancy_24h: number;
  total_bed_occupancy_24h: number;
  ed_congestion_probability: number;
  staffing_overload_probability: number;
}

export interface ClinicalBlock {
  high_risk_patients: number;
  deterioration_alerts_24h: number;
  top_risk_factors: string[];
}

export interface MedicationSafetyBlock {
  critical_alerts_24h: number;
  high_alert_med_admin_count: number;
  top_interaction_classes: string[];
}

export interface OperationsBlock {
  icu_capacity_risk: string;
  total_bed_capacity_risk: string;
  ventilator_capacity_risk: string;
  staffing_strain_risk: string;
  surge_alerts: string[];
}

export interface MLBlock {
  active_model_version: string;
  predictions_last_24h: number;
  drift_detected: boolean;
  confidence_distribution: Record<string, number>;
}

export interface CommandDashboardResponse {
  system_status: SystemStatusBlock;
  clinical: ClinicalBlock;
  medication_safety: MedicationSafetyBlock;
  operations: OperationsBlock;
  ml: MLBlock;
  generated_at: string;
}
