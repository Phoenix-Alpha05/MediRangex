from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class OperationsRiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SystemStatus(str, Enum):
    NORMAL = "NORMAL"
    STRAINED = "STRAINED"
    SURGE = "SURGE"


class OperationsRiskRequest(BaseModel):
    timestamp: datetime
    icu_occupancy_percent: float = Field(..., ge=0, le=100)
    total_bed_occupancy_percent: float = Field(..., ge=0, le=100)
    ed_waiting_patients: int = Field(..., ge=0)
    ed_boarding_patients: int = Field(..., ge=0)
    ventilator_utilization_percent: float = Field(..., ge=0, le=100)
    nurse_patient_ratio: float = Field(..., ge=0, description="Patients per nurse, e.g. 4.0 = 1 nurse per 4 patients (1:4)")
    admissions_last_6h: int = Field(..., ge=0)
    discharges_last_6h: int = Field(..., ge=0)
    elective_surgeries_next_24h: int = Field(..., ge=0)


class OperationsRiskResponse(BaseModel):
    system_status: SystemStatus
    icu_capacity_risk: OperationsRiskLevel
    total_bed_capacity_risk: OperationsRiskLevel
    ed_congestion_risk: OperationsRiskLevel
    ventilator_capacity_risk: OperationsRiskLevel
    staffing_strain_risk: OperationsRiskLevel
    triggered_factors: List[str]
    operational_alerts: List[str]
    recommended_actions: List[str]
    engine_version: str
    evaluated_at: datetime


class ICUCapacityRequest(BaseModel):
    unit_id: str
    current_census: int = Field(..., ge=0)
    total_beds: int = Field(..., ge=1)
    avg_los_days: float = Field(..., ge=0)
    pending_admissions: int = Field(0, ge=0)
    forecast_hours: int = Field(24, ge=1, le=168, description="Hours to forecast (max 7 days)")


class CapacityPoint(BaseModel):
    timestamp: datetime
    predicted_census: float
    confidence_lower: float
    confidence_upper: float
    occupancy_pct: float


class ICUCapacityResponse(BaseModel):
    unit_id: str
    current_occupancy_pct: float
    forecast: List[CapacityPoint]
    surge_risk: str
    recommended_actions: List[str]
    model_version: str
    generated_at: datetime
