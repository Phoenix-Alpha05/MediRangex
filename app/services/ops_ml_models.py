import math

from app.schemas.ops_ml import OccupancyForecast, OperationsMLFeatures

MODEL_VERSION = "ops_ml_baseline_v1"


def _sigmoid(x: float) -> float:
    x = _clamp(x, -10.0, 10.0)
    return 1.0 / (1.0 + math.exp(-x))


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def forecast_icu_occupancy(
    features: OperationsMLFeatures,
    horizon_hours: int,
) -> OccupancyForecast:
    momentum = features.icu_occupancy_delta_6h or 0.0
    flow_pressure = features.net_flow_24h / 100.0
    drift = (momentum * 0.6 + flow_pressure * 0.4) * (horizon_hours / 24.0)
    point = _clamp(features.icu_occupancy_percent + drift, 0.0, 100.0)
    band = max(3.0, abs(drift) * 0.5)
    ci = (_clamp(point - band, 0.0, 100.0), _clamp(point + band, 0.0, 100.0))
    return OccupancyForecast(point=round(point, 2), ci=ci)


def forecast_bed_occupancy(
    features: OperationsMLFeatures,
    horizon_hours: int,
) -> OccupancyForecast:
    momentum = float(features.admissions_delta_6h or 0)
    flow_pressure = features.net_flow_24h / 100.0
    drift = (momentum * 0.6 + flow_pressure * 0.4) * (horizon_hours / 24.0)
    point = _clamp(features.total_bed_occupancy_percent + drift, 0.0, 100.0)
    band = max(3.0, abs(drift) * 0.5)
    ci = (_clamp(point - band, 0.0, 100.0), _clamp(point + band, 0.0, 100.0))
    return OccupancyForecast(point=round(point, 2), ci=ci)


def forecast_ed_congestion_probability(features: OperationsMLFeatures) -> float:
    score = (
        0.05 * features.ed_waiting_patients
        + 0.08 * features.ed_boarding_patients
        + 0.6 * features.emergency_case_ratio
        + 0.03 * features.admissions_last_6h
        + 0.4 * float(features.ed_boarding_delta_6h or 0)
    )
    return round(_sigmoid(score), 4)


def forecast_staffing_overload_probability(features: OperationsMLFeatures) -> float:
    score = (
        1.0 * features.nurse_patients_per_nurse
        + 0.5 * features.physician_patients_per_physician
        + 0.03 * features.overtime_hours_last_7d
    )
    return round(_sigmoid(score), 4)
