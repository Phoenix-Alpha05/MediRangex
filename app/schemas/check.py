from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from uuid import UUID


class DrugEntry(BaseModel):
    rxnorm_code: Optional[str] = None
    drug_name: str
    dose: Optional[str] = None
    route: Optional[str] = None


class PatientContext(BaseModel):
    egfr: Optional[float] = Field(None, description="eGFR in mL/min/1.73m² — used to escalate nephrotoxin severity")
    platelets: Optional[float] = Field(None, description="Platelet count × 10⁹/L — used to escalate bleeding risk")
    qtc_ms: Optional[float] = Field(None, description="Corrected QT interval in milliseconds")
    age_years: Optional[int] = Field(None, description="Patient age in years")
    weight_kg: Optional[float] = Field(None, description="Patient weight in kilograms")
    is_pregnant: Optional[bool] = Field(None, description="Pregnancy status")
    creatinine_umol: Optional[float] = Field(None, description="Serum creatinine in µmol/L")
    inr: Optional[float] = Field(None, description="INR — elevates warfarin interaction severity when supratherapeutic")
    potassium_mmol: Optional[float] = Field(None, description="Serum potassium in mmol/L — escalates hyperkalaemia risk")


class DrugInteractionRequest(BaseModel):
    patient_id: UUID
    drugs: List[DrugEntry]
    patient_conditions: Optional[List[str]] = None
    patient_context: Optional[PatientContext] = None


class ContextModifier(BaseModel):
    trigger: str
    threshold_description: str
    affected_alert_types: List[str]
    severity_escalated_to: Literal["CRITICAL", "WARNING"]
    rationale: str


class DrugAlert(BaseModel):
    type: str
    severity: str
    drugs: List[str]
    mechanism: str
    clinical_risk: str
    interaction_class: str
    confidence_level: str
    evidence_source: str
    recommendation: str
    context_modifiers_applied: List[ContextModifier] = []


class AlertSummary(BaseModel):
    total_alerts: int
    critical: int
    warnings: int


class DrugInteractionResponse(BaseModel):
    patient_id: UUID
    alerts: List[DrugAlert]
    summary: AlertSummary
    recommended_actions: List[str]
    engine_version: str
    checked_at: str
    context_flags: List[str] = []
