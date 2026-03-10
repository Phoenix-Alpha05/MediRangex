from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.schemas.check import (
    DrugInteractionRequest,
    DrugInteractionResponse,
    DrugAlert,
    AlertSummary,
    ContextModifier,
)
from app.auth.rbac import require_pharmacist
from app.models.user import User
from app.services.drug_safety_engine import run_drug_safety_check
from app.services.patient_context_modifiers import PatientContextInput

router = APIRouter(prefix="/check", tags=["Clinical Checks"])


def _build_context(request: DrugInteractionRequest) -> PatientContextInput | None:
    if request.patient_context is None:
        return None
    ctx = request.patient_context
    return PatientContextInput(
        egfr=ctx.egfr,
        platelets=ctx.platelets,
        qtc_ms=ctx.qtc_ms,
        age_years=ctx.age_years,
        weight_kg=ctx.weight_kg,
        is_pregnant=ctx.is_pregnant,
        creatinine_umol=ctx.creatinine_umol,
        inr=ctx.inr,
        potassium_mmol=ctx.potassium_mmol,
    )


@router.post("/drug-interactions", response_model=DrugInteractionResponse)
def check_drug_interactions(
    request: DrugInteractionRequest,
    _: User = Depends(require_pharmacist),
):
    drug_names = [d.drug_name for d in request.drugs]

    result = run_drug_safety_check(
        patient_id=request.patient_id,
        drug_names=drug_names,
        patient_conditions=request.patient_conditions,
        patient_context=_build_context(request),
    )

    alerts = [
        DrugAlert(
            type=a["type"],
            severity=a["severity"],
            drugs=a["drugs"],
            mechanism=a["mechanism"],
            clinical_risk=a["clinical_risk"],
            interaction_class=a.get("interaction_class", "PD"),
            confidence_level=a.get("confidence_level", "MODERATE"),
            evidence_source=a.get("evidence_source", "literature"),
            recommendation=a["recommendation"],
            context_modifiers_applied=[
                ContextModifier(
                    trigger=m["trigger"],
                    threshold_description=m["threshold_description"],
                    affected_alert_types=m["affected_alert_types"],
                    severity_escalated_to=m["severity_escalated_to"],
                    rationale=m["rationale"],
                )
                for m in a.get("context_modifiers_applied", [])
            ],
        )
        for a in result["alerts"]
    ]

    return DrugInteractionResponse(
        patient_id=request.patient_id,
        alerts=alerts,
        summary=AlertSummary(
            total_alerts=result["summary"]["total_alerts"],
            critical=result["summary"]["critical"],
            warnings=result["summary"]["warnings"],
        ),
        recommended_actions=result["recommended_actions"],
        engine_version=result["engine_version"],
        checked_at=datetime.now(timezone.utc).isoformat(),
        context_flags=result.get("context_flags", []),
    )
