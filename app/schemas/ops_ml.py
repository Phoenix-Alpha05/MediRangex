from pydantic import BaseModel, Field
from typing import Any, Literal, Optional
from datetime import datetime
from enum import Enum


class OperationsMLRequest(BaseModel):
    raw_input: dict[str, Any]


class ConfidenceLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ModelType(str, Enum):
    STATISTICAL = "statistical"
    ML = "ml"
    HYBRID = "hybrid"


class OperationsMLFeatures(BaseModel):
    timestamp: datetime
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    is_weekend: bool
    is_holiday: bool

    admissions_last_1h: int = Field(..., ge=0)
    admissions_last_6h: int = Field(..., ge=0)
    admissions_last_24h: int = Field(..., ge=0)
    discharges_last_1h: int = Field(..., ge=0)
    discharges_last_6h: int = Field(..., ge=0)
    discharges_last_24h: int = Field(..., ge=0)
    net_flow_24h: int

    icu_occupancy_percent: float = Field(..., ge=0, le=100)
    total_bed_occupancy_percent: float = Field(..., ge=0, le=100)
    ed_waiting_patients: int = Field(..., ge=0)
    ed_boarding_patients: int = Field(..., ge=0)
    ventilator_utilization_percent: float = Field(..., ge=0, le=100)

    avg_length_of_stay_days: float = Field(..., ge=0)
    elective_surgeries_next_24h: int = Field(..., ge=0)
    emergency_case_ratio: float = Field(..., ge=0, le=1)

    nurse_patients_per_nurse: float = Field(..., ge=0)
    physician_patients_per_physician: float = Field(..., ge=0)
    overtime_hours_last_7d: float = Field(..., ge=0)

    heat_index: float
    air_quality_index: float = Field(..., ge=0)
    outbreak_signal_level: float = Field(..., ge=0, le=1)
    referral_load_index: float = Field(..., ge=0)

    icu_occupancy_delta_6h: Optional[float] = Field(
        default=None,
        description="Change in ICU occupancy % over the past 6 hours",
    )
    admissions_delta_6h: Optional[int] = Field(
        default=None,
        description="Change in admission count over the past 6 hours",
    )
    ed_boarding_delta_6h: Optional[int] = Field(
        default=None,
        description="Change in ED boarding patient count over the past 6 hours",
    )

    forecast_horizons_hours: list[int] = Field(
        default=[6, 24],
        description="Forecast horizons in hours; drives which output slots are populated",
    )
    feature_window_hours: int = Field(
        default=24,
        ge=1,
        description="Lookback window used to compute input features",
    )


class OccupancyForecast(BaseModel):
    point: float = Field(..., ge=0, le=100)
    ci: Optional[tuple[float, float]] = Field(
        default=None,
        description="95% confidence interval as (lower, upper) percentages",
    )


class OperationsMLForecast(BaseModel):
    icu_occupancy_forecast_6h: OccupancyForecast
    icu_occupancy_forecast_24h: OccupancyForecast
    bed_occupancy_forecast_24h: OccupancyForecast
    ed_congestion_risk_probability: float = Field(..., ge=0, le=1)
    staffing_overload_probability: float = Field(..., ge=0, le=1)
    confidence_level: ConfidenceLevel
    model_version: str
    model_type: ModelType
    predicted_at: datetime
