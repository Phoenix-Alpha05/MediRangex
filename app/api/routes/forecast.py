from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta
from app.schemas.forecast import (
    ICUCapacityRequest,
    ICUCapacityResponse,
    CapacityPoint,
    OperationsRiskRequest,
    OperationsRiskResponse,
)
from app.auth.rbac import require_data_scientist
from app.models.user import User
from app.knowledge_bank.registry import get_module_payload
from app.services.operations_forecast_engine import run_operations_forecast

router = APIRouter(prefix="/forecast", tags=["Forecasting"])


@router.post("/icu-capacity", response_model=ICUCapacityResponse)
def forecast_icu_capacity(
    request: ICUCapacityRequest,
    _: User = Depends(require_data_scientist),
):
    _kb_ops = get_module_payload("hospital_operations_forecasting")

    now = datetime.now(timezone.utc)
    current_occ = round((request.current_census / request.total_beds) * 100, 1)

    forecast_points: list[CapacityPoint] = []
    for h in range(0, request.forecast_hours, max(1, request.forecast_hours // 8)):
        predicted = min(request.total_beds, request.current_census + (h * 0.1))
        occ_pct = round((predicted / request.total_beds) * 100, 1)
        forecast_points.append(
            CapacityPoint(
                timestamp=now + timedelta(hours=h),
                predicted_census=round(predicted, 1),
                confidence_lower=round(predicted * 0.85, 1),
                confidence_upper=round(min(request.total_beds, predicted * 1.15), 1),
                occupancy_pct=occ_pct,
            )
        )

    surge_risk = "high" if current_occ >= 85 else "moderate" if current_occ >= 70 else "low"
    actions = (
        ["Activate surge protocol", "Contact on-call bed manager"]
        if surge_risk == "high"
        else ["Monitor hourly", "Review pending discharges"]
    )

    return ICUCapacityResponse(
        unit_id=request.unit_id,
        current_occupancy_pct=current_occ,
        forecast=forecast_points,
        surge_risk=surge_risk,
        recommended_actions=actions,
        model_version="stub-v0.1",
        generated_at=now,
    )


@router.post("/operations-risk", response_model=OperationsRiskResponse)
def forecast_operations_risk(
    request: OperationsRiskRequest,
    _: User = Depends(require_data_scientist),
):
    result = run_operations_forecast(
        timestamp=request.timestamp,
        icu_occupancy_percent=request.icu_occupancy_percent,
        total_bed_occupancy_percent=request.total_bed_occupancy_percent,
        ed_waiting_patients=request.ed_waiting_patients,
        ed_boarding_patients=request.ed_boarding_patients,
        ventilator_utilization_percent=request.ventilator_utilization_percent,
        nurse_patient_ratio=request.nurse_patient_ratio,
        admissions_last_6h=request.admissions_last_6h,
        discharges_last_6h=request.discharges_last_6h,
        elective_surgeries_next_24h=request.elective_surgeries_next_24h,
    )
    return OperationsRiskResponse(**result)
