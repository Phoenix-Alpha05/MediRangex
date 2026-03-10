from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.schemas.predict import SepsisRiskRequest, SepsisRiskResponse
from app.auth.rbac import require_clinician
from app.models.user import User
from app.knowledge_bank.registry import get_module_payload
from app.services.sepsis_engine import evaluate_sepsis_risk

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("/sepsis-risk", response_model=SepsisRiskResponse)
def predict_sepsis_risk(
    request: SepsisRiskRequest,
    _: User = Depends(require_clinician),
):
    get_module_payload("clinical_risk_feature_store")
    get_module_payload("clinical_protocols_sepsis")
    get_module_payload("clinical_knowledge_graph")

    result = evaluate_sepsis_risk(
        heart_rate=request.heart_rate,
        respiratory_rate=request.respiratory_rate,
        temperature_celsius=request.temperature_celsius,
        systolic_bp=request.systolic_bp,
        care_setting=request.care_setting,
        lactate=request.lactate,
    )

    return SepsisRiskResponse(
        patient_id=request.patient_id,
        risk_score_raw=result.risk_score_raw,
        risk_probability=None,
        risk_level=result.risk_level,
        time_to_deterioration=result.time_to_deterioration,
        triggered_factors=result.triggered_factors,
        clinical_rationale=result.clinical_rationale,
        recommended_actions=result.recommended_actions,
        engine_version=result.engine_version,
        evaluated_at=datetime.now(timezone.utc),
    )
