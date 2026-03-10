from datetime import datetime, timezone
from typing import Any

from app.schemas.ops_ml import ConfidenceLevel, ModelType, OperationsMLForecast
from app.services.ml_observability import detect_feature_drift, log_ml_prediction
from app.services.ops_ml_feature_pipeline import build_ops_ml_features
from app.services.ops_ml_models import (
    MODEL_VERSION,
    forecast_bed_occupancy,
    forecast_ed_congestion_probability,
    forecast_icu_occupancy,
    forecast_staffing_overload_probability,
)

_MODEL_NAME = "capacity_forecast"
_MODEL_TYPE = ModelType.ML


def _derive_confidence(features_dict: dict[str, Any]) -> ConfidenceLevel:
    delta_fields = ("icu_occupancy_delta_6h", "admissions_delta_6h", "ed_boarding_delta_6h")
    present = sum(1 for f in delta_fields if f in features_dict and features_dict[f] is not None)
    if present == len(delta_fields):
        return ConfidenceLevel.HIGH
    if present >= 1:
        return ConfidenceLevel.MEDIUM
    return ConfidenceLevel.LOW


def generate_ops_ml_forecast(raw_input: dict[str, Any], trace_id: str) -> OperationsMLForecast:
    features = build_ops_ml_features(raw_input)

    detect_feature_drift(features)

    icu_6h = forecast_icu_occupancy(features, horizon_hours=6)
    icu_24h = forecast_icu_occupancy(features, horizon_hours=24)
    bed_24h = forecast_bed_occupancy(features, horizon_hours=24)
    ed_prob = forecast_ed_congestion_probability(features)
    staff_prob = forecast_staffing_overload_probability(features)

    confidence = _derive_confidence(raw_input)

    forecast = OperationsMLForecast(
        icu_occupancy_forecast_6h=icu_6h,
        icu_occupancy_forecast_24h=icu_24h,
        bed_occupancy_forecast_24h=bed_24h,
        ed_congestion_risk_probability=ed_prob,
        staffing_overload_probability=staff_prob,
        confidence_level=confidence,
        model_version=MODEL_VERSION,
        model_type=_MODEL_TYPE,
        predicted_at=datetime.now(timezone.utc),
    )

    log_ml_prediction(
        domain="operations",
        model_name=_MODEL_NAME,
        model_version=MODEL_VERSION,
        model_type=_MODEL_TYPE.value,
        input_features=features,
        output_predictions=forecast,
        confidence_level=confidence.value,
        trace_id=trace_id,
    )

    return forecast
