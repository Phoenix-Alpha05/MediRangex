from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.schemas.reason import ClinicalPathwayRequest, ClinicalPathwayResponse, PathwayStep
from app.auth.rbac import require_clinician
from app.models.user import User
from app.knowledge_bank.registry import get_module_payload

router = APIRouter(prefix="/reason", tags=["Clinical Reasoning"])


@router.post("/clinical-pathway", response_model=ClinicalPathwayResponse)
def reason_clinical_pathway(
    request: ClinicalPathwayRequest,
    _: User = Depends(require_clinician),
):
    _kb_graph = get_module_payload("clinical_knowledge_graph")
    _kb_protocols = get_module_payload("clinical_protocols_sepsis")

    stub_steps = [
        PathwayStep(
            step_number=1,
            action="Obtain blood cultures x2 before antibiotics",
            rationale="Source identification guides targeted therapy",
            priority="urgent",
            timeframe="Within 1 hour of suspicion",
            responsible_role="clinician",
            evidence_level="Grade A",
        ),
        PathwayStep(
            step_number=2,
            action="Administer broad-spectrum antibiotics",
            rationale="Early antibiotic therapy reduces mortality",
            priority="urgent",
            timeframe="Within 1 hour of suspicion",
            responsible_role="clinician",
            evidence_level="Grade A",
        ),
        PathwayStep(
            step_number=3,
            action="IV fluid resuscitation 30mL/kg crystalloid",
            rationale="Restore perfusion pressure",
            priority="high",
            timeframe="Within 3 hours",
            responsible_role="clinician",
            evidence_level="Grade A",
        ),
    ]

    return ClinicalPathwayResponse(
        patient_id=request.patient_id,
        pathway_name=f"Sepsis Bundle — {request.primary_diagnosis}",
        primary_diagnosis=request.primary_diagnosis,
        recommended_steps=stub_steps,
        contraindications=["Avoid nephrotoxic agents in AKI"],
        monitoring_parameters=["Lactate q2h", "UO q1h", "MAP q1h"],
        escalation_criteria=["MAP < 65 despite fluids", "Lactate > 4 mmol/L"],
        references=["Surviving Sepsis Campaign 2021", "NICE NG51"],
        model_version="stub-v0.1",
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
