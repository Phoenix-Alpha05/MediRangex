from datetime import datetime, timezone
from typing import Any

from app.schemas.ops_ml import OperationsMLFeatures


def _to_utc(ts: datetime) -> datetime:
    if ts.tzinfo is None:
        return ts.replace(tzinfo=timezone.utc)
    return ts.astimezone(timezone.utc)


def build_ops_ml_features(raw: dict[str, Any]) -> OperationsMLFeatures:
    ts: datetime = _to_utc(raw["timestamp"])

    hour_of_day: int = ts.hour
    day_of_week: int = ts.weekday()
    is_weekend: bool = day_of_week >= 5
    is_holiday: bool = False

    admissions_last_1h: int = int(raw["admissions_last_1h"])
    admissions_last_6h: int = int(raw["admissions_last_6h"])
    admissions_last_24h: int = int(raw["admissions_last_24h"])
    discharges_last_1h: int = int(raw["discharges_last_1h"])
    discharges_last_6h: int = int(raw["discharges_last_6h"])
    discharges_last_24h: int = int(raw["discharges_last_24h"])
    net_flow_24h: int = admissions_last_24h - discharges_last_24h

    total_cases: float = float(raw.get("total_cases", 0))
    emergency_cases: float = float(raw.get("emergency_cases", 0))
    emergency_case_ratio: float = (
        emergency_cases / total_cases if total_cases > 0 else 0.0
    )

    icu_occupancy_delta_6h: float | None = (
        float(raw["icu_occupancy_delta_6h"])
        if "icu_occupancy_delta_6h" in raw
        else None
    )
    admissions_delta_6h: int | None = (
        int(raw["admissions_delta_6h"])
        if "admissions_delta_6h" in raw
        else None
    )
    ed_boarding_delta_6h: int | None = (
        int(raw["ed_boarding_delta_6h"])
        if "ed_boarding_delta_6h" in raw
        else None
    )

    return OperationsMLFeatures(
        timestamp=ts,
        hour_of_day=hour_of_day,
        day_of_week=day_of_week,
        is_weekend=is_weekend,
        is_holiday=is_holiday,
        admissions_last_1h=admissions_last_1h,
        admissions_last_6h=admissions_last_6h,
        admissions_last_24h=admissions_last_24h,
        discharges_last_1h=discharges_last_1h,
        discharges_last_6h=discharges_last_6h,
        discharges_last_24h=discharges_last_24h,
        net_flow_24h=net_flow_24h,
        icu_occupancy_percent=float(raw["icu_occupancy_percent"]),
        total_bed_occupancy_percent=float(raw["total_bed_occupancy_percent"]),
        ed_waiting_patients=int(raw["ed_waiting_patients"]),
        ed_boarding_patients=int(raw["ed_boarding_patients"]),
        ventilator_utilization_percent=float(raw["ventilator_utilization_percent"]),
        avg_length_of_stay_days=float(raw["avg_length_of_stay_days"]),
        elective_surgeries_next_24h=int(raw["elective_surgeries_next_24h"]),
        emergency_case_ratio=emergency_case_ratio,
        nurse_patients_per_nurse=float(raw["nurse_patients_per_nurse"]),
        physician_patients_per_physician=float(raw["physician_patients_per_physician"]),
        overtime_hours_last_7d=float(raw["overtime_hours_last_7d"]),
        heat_index=float(raw["heat_index"]),
        air_quality_index=float(raw["air_quality_index"]),
        outbreak_signal_level=float(raw["outbreak_signal_level"]),
        referral_load_index=float(raw["referral_load_index"]),
        forecast_horizons_hours=raw.get("forecast_horizons_hours", [6, 24]),
        feature_window_hours=int(raw.get("feature_window_hours", 24)),
        icu_occupancy_delta_6h=icu_occupancy_delta_6h,
        admissions_delta_6h=admissions_delta_6h,
        ed_boarding_delta_6h=ed_boarding_delta_6h,
    )
