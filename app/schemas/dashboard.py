from datetime import datetime
from typing import Dict, List
from pydantic import BaseModel


class SystemStatusBlock(BaseModel):
    system_status: str
    icu_occupancy_6h: float
    icu_occupancy_24h: float
    total_bed_occupancy_24h: float
    ed_congestion_probability: float
    staffing_overload_probability: float


class ClinicalBlock(BaseModel):
    high_risk_patients: int
    deterioration_alerts_24h: int
    top_risk_factors: List[str]


class MedicationSafetyBlock(BaseModel):
    critical_alerts_24h: int
    high_alert_med_admin_count: int
    top_interaction_classes: List[str]


class OperationsBlock(BaseModel):
    icu_capacity_risk: str
    total_bed_capacity_risk: str
    ventilator_capacity_risk: str
    staffing_strain_risk: str
    surge_alerts: List[str]


class MLBlock(BaseModel):
    active_model_version: str
    predictions_last_24h: int
    drift_detected: bool
    confidence_distribution: Dict[str, int]


class CommandDashboardResponse(BaseModel):
    system_status: SystemStatusBlock
    clinical: ClinicalBlock
    medication_safety: MedicationSafetyBlock
    operations: OperationsBlock
    ml: MLBlock
    generated_at: datetime
