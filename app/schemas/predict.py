from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.patient import CareSettingEnum


class SepsisRiskRequest(BaseModel):
    patient_id: UUID
    heart_rate: float = Field(..., ge=0, le=300, description="Heart rate in bpm")
    respiratory_rate: float = Field(..., ge=0, le=60, description="Resp rate in breaths/min")
    temperature_celsius: float = Field(..., ge=30, le=45, description="Temperature in Celsius")
    systolic_bp: float = Field(..., ge=0, le=300, description="Systolic BP in mmHg")
    wbc_count: Optional[float] = Field(None, description="WBC count x10^9/L")
    lactate: Optional[float] = Field(None, description="Lactate mmol/L")
    care_setting: CareSettingEnum


class SepsisRiskResponse(BaseModel):
    patient_id: UUID
    risk_score_raw: int = Field(..., ge=0, description="Composite rule-based score (integer, 0–12+)")
    risk_probability: Optional[float] = Field(None, ge=0.0, le=1.0, description="ML model probability (0–1); null until ML layer is active")
    risk_level: str = Field(..., description="Low | Moderate | High | Critical")
    time_to_deterioration: str = Field(..., description="Estimated deterioration window")
    triggered_factors: List[str] = Field(..., description="Clinical criteria that contributed to score")
    clinical_rationale: str = Field(..., description="Narrative explanation of findings")
    recommended_actions: List[str] = Field(..., description="Prioritised clinical action list")
    engine_version: str = Field(..., description="Risk engine version identifier")
    evaluated_at: datetime
