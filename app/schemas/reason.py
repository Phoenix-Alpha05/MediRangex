from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID


class ClinicalPathwayRequest(BaseModel):
    patient_id: UUID
    primary_diagnosis: str
    comorbidities: List[str] = []
    current_medications: List[str] = []
    care_setting: str
    clinical_notes: Optional[str] = None


class PathwayStep(BaseModel):
    step_number: int
    action: str
    rationale: str
    priority: str
    timeframe: str
    responsible_role: str
    evidence_level: str


class ClinicalPathwayResponse(BaseModel):
    patient_id: UUID
    pathway_name: str
    primary_diagnosis: str
    recommended_steps: List[PathwayStep]
    contraindications: List[str]
    monitoring_parameters: List[str]
    escalation_criteria: List[str]
    references: List[str]
    model_version: str
    generated_at: str
