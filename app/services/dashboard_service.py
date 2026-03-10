from datetime import datetime, timedelta, timezone
from typing import Counter

from sqlalchemy.orm import Session

from app.models.alert_log import AlertLog, AlertSeverityEnum
from app.models.ml_prediction_log import MlPredictionLog
from app.models.prediction_log import PredictionLog
from app.schemas.dashboard import (
    ClinicalBlock,
    CommandDashboardResponse,
    MLBlock,
    MedicationSafetyBlock,
    OperationsBlock,
    SystemStatusBlock,
)
from app.services.ml_observability import detect_feature_drift
from app.services.ops_ml_models import MODEL_VERSION


_FALLBACK_ICU_6H = 0.0
_FALLBACK_ICU_24H = 0.0
_FALLBACK_BED_24H = 0.0
_FALLBACK_ED_PROB = 0.0
_FALLBACK_STAFF_PROB = 0.0
_FALLBACK_SYSTEM_STATUS = "UNKNOWN"


def _build_system_block(db: Session) -> SystemStatusBlock:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)

    latest: MlPredictionLog | None = (
        db.query(MlPredictionLog)
        .filter(
            MlPredictionLog.model_domain == "operations",
            MlPredictionLog.created_at >= cutoff,
        )
        .order_by(MlPredictionLog.created_at.desc())
        .first()
    )

    if latest and latest.output_predictions_json:
        import json

        try:
            out = json.loads(latest.output_predictions_json)
            icu_6h = out.get("icu_occupancy_forecast_6h", {}).get("point", _FALLBACK_ICU_6H)
            icu_24h = out.get("icu_occupancy_forecast_24h", {}).get("point", _FALLBACK_ICU_24H)
            bed_24h = out.get("bed_occupancy_forecast_24h", {}).get("point", _FALLBACK_BED_24H)
            ed_prob = out.get("ed_congestion_risk_probability", _FALLBACK_ED_PROB)
            staff_prob = out.get("staffing_overload_probability", _FALLBACK_STAFF_PROB)

            if icu_6h >= 85 or bed_24h >= 90:
                system_status = "SURGE"
            elif icu_6h >= 70 or bed_24h >= 80 or ed_prob >= 0.7:
                system_status = "STRAINED"
            else:
                system_status = "NORMAL"

            return SystemStatusBlock(
                system_status=system_status,
                icu_occupancy_6h=round(float(icu_6h), 2),
                icu_occupancy_24h=round(float(icu_24h), 2),
                total_bed_occupancy_24h=round(float(bed_24h), 2),
                ed_congestion_probability=round(float(ed_prob), 4),
                staffing_overload_probability=round(float(staff_prob), 4),
            )
        except Exception:
            pass

    return SystemStatusBlock(
        system_status=_FALLBACK_SYSTEM_STATUS,
        icu_occupancy_6h=_FALLBACK_ICU_6H,
        icu_occupancy_24h=_FALLBACK_ICU_24H,
        total_bed_occupancy_24h=_FALLBACK_BED_24H,
        ed_congestion_probability=_FALLBACK_ED_PROB,
        staffing_overload_probability=_FALLBACK_STAFF_PROB,
    )


def _build_clinical_block(db: Session) -> ClinicalBlock:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    deterioration_alerts = (
        db.query(AlertLog)
        .filter(
            AlertLog.triggered_at >= cutoff,
            AlertLog.alert_type.in_(["sepsis", "deterioration", "clinical_alert"]),
        )
        .all()
    )

    factor_counter: Counter = Counter()
    for alert in deterioration_alerts:
        if alert.title:
            factor_counter[alert.title] += 1

    high_risk_logs = (
        db.query(PredictionLog)
        .filter(
            PredictionLog.requested_at >= cutoff,
            PredictionLog.model_type == "sepsis",
            PredictionLog.confidence_score >= 0.7,
        )
        .count()
    )

    top_factors = [factor for factor, _ in factor_counter.most_common(5)]

    return ClinicalBlock(
        high_risk_patients=high_risk_logs,
        deterioration_alerts_24h=len(deterioration_alerts),
        top_risk_factors=top_factors,
    )


def _build_medication_safety_block(db: Session) -> MedicationSafetyBlock:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    critical_alerts = (
        db.query(AlertLog)
        .filter(
            AlertLog.triggered_at >= cutoff,
            AlertLog.alert_type == "medication",
            AlertLog.severity == AlertSeverityEnum.critical,
        )
        .all()
    )

    high_alert_count = (
        db.query(AlertLog)
        .filter(
            AlertLog.triggered_at >= cutoff,
            AlertLog.alert_type == "high_alert_medication",
        )
        .count()
    )

    class_counter: Counter = Counter()
    for alert in critical_alerts:
        if alert.message:
            for segment in alert.message.split(";"):
                segment = segment.strip()
                if "interaction_class" in segment.lower() or "PD" in segment or "PK" in segment:
                    class_counter[segment] += 1
            if alert.title:
                class_counter[alert.title] += 1

    top_classes = [cls for cls, _ in class_counter.most_common(5)]

    return MedicationSafetyBlock(
        critical_alerts_24h=len(critical_alerts),
        high_alert_med_admin_count=high_alert_count,
        top_interaction_classes=top_classes,
    )


def _build_operations_block(db: Session) -> OperationsBlock:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=1)

    latest: MlPredictionLog | None = (
        db.query(MlPredictionLog)
        .filter(
            MlPredictionLog.model_domain == "operations",
            MlPredictionLog.created_at >= cutoff,
        )
        .order_by(MlPredictionLog.created_at.desc())
        .first()
    )

    icu_risk = "UNKNOWN"
    bed_risk = "UNKNOWN"
    vent_risk = "UNKNOWN"
    staff_risk = "UNKNOWN"
    surge_alerts: list[str] = []

    if latest and latest.output_predictions_json:
        import json

        try:
            out = json.loads(latest.output_predictions_json)
            icu_pt = float(out.get("icu_occupancy_forecast_24h", {}).get("point", 0))
            bed_pt = float(out.get("bed_occupancy_forecast_24h", {}).get("point", 0))
            ed_prob = float(out.get("ed_congestion_risk_probability", 0))
            staff_prob = float(out.get("staffing_overload_probability", 0))

            def _level(pct: float) -> str:
                if pct >= 95:
                    return "CRITICAL"
                if pct >= 85:
                    return "HIGH"
                if pct >= 70:
                    return "MODERATE"
                return "LOW"

            def _prob_level(p: float) -> str:
                if p >= 0.85:
                    return "CRITICAL"
                if p >= 0.65:
                    return "HIGH"
                if p >= 0.4:
                    return "MODERATE"
                return "LOW"

            icu_risk = _level(icu_pt)
            bed_risk = _level(bed_pt)
            vent_risk = "LOW"
            staff_risk = _prob_level(staff_prob)

            if icu_risk in ("CRITICAL", "HIGH") and bed_risk in ("CRITICAL", "HIGH"):
                surge_alerts.append("Hospital surge state")
            elif ed_prob >= 0.7:
                surge_alerts.append("ED congestion critical")
            if staff_risk == "CRITICAL":
                surge_alerts.append("Unsafe nurse staffing ratio")
        except Exception:
            pass

    return OperationsBlock(
        icu_capacity_risk=icu_risk,
        total_bed_capacity_risk=bed_risk,
        ventilator_capacity_risk=vent_risk,
        staffing_strain_risk=staff_risk,
        surge_alerts=surge_alerts,
    )


def _build_ml_block(db: Session) -> MLBlock:
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)

    logs = (
        db.query(MlPredictionLog)
        .filter(MlPredictionLog.created_at >= cutoff)
        .all()
    )

    confidence_dist: Counter = Counter({"LOW": 0, "MEDIUM": 0, "HIGH": 0})
    for log in logs:
        if log.confidence_level:
            confidence_dist[log.confidence_level.upper()] += 1

    drift_detected = detect_feature_drift(None)  # type: ignore[arg-type]

    return MLBlock(
        active_model_version=MODEL_VERSION,
        predictions_last_24h=len(logs),
        drift_detected=drift_detected,
        confidence_distribution=dict(confidence_dist),
    )


def _empty_dashboard() -> CommandDashboardResponse:
    return CommandDashboardResponse(
        system_status=SystemStatusBlock(
            system_status=_FALLBACK_SYSTEM_STATUS,
            icu_occupancy_6h=_FALLBACK_ICU_6H,
            icu_occupancy_24h=_FALLBACK_ICU_24H,
            total_bed_occupancy_24h=_FALLBACK_BED_24H,
            ed_congestion_probability=_FALLBACK_ED_PROB,
            staffing_overload_probability=_FALLBACK_STAFF_PROB,
        ),
        clinical=ClinicalBlock(
            high_risk_patients=0,
            deterioration_alerts_24h=0,
            top_risk_factors=[],
        ),
        medication_safety=MedicationSafetyBlock(
            critical_alerts_24h=0,
            high_alert_med_admin_count=0,
            top_interaction_classes=[],
        ),
        operations=OperationsBlock(
            icu_capacity_risk="UNKNOWN",
            total_bed_capacity_risk="UNKNOWN",
            ventilator_capacity_risk="UNKNOWN",
            staffing_strain_risk="UNKNOWN",
            surge_alerts=[],
        ),
        ml=MLBlock(
            active_model_version=MODEL_VERSION,
            predictions_last_24h=0,
            drift_detected=False,
            confidence_distribution={"LOW": 0, "MEDIUM": 0, "HIGH": 0},
        ),
        generated_at=datetime.now(timezone.utc),
    )


def generate_command_dashboard(db: Session) -> CommandDashboardResponse:
    try:
        return CommandDashboardResponse(
            system_status=_build_system_block(db),
            clinical=_build_clinical_block(db),
            medication_safety=_build_medication_safety_block(db),
            operations=_build_operations_block(db),
            ml=_build_ml_block(db),
            generated_at=datetime.now(timezone.utc),
        )
    except Exception:
        return _empty_dashboard()
