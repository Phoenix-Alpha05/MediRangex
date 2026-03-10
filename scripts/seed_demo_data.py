import json
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models.alert_log import AlertLog, AlertSeverityEnum, AlertStatusEnum
from app.models.ml_prediction_log import MlPredictionLog
from app.models.patient import Patient, SexEnum, CareSettingEnum
from app.models.prediction_log import PredictionLog
from app.models.user import User

_DEMO_PATIENTS = [
    {"mrn": "MRX-10001", "full_name": "James Carter", "age": 68, "sex": SexEnum.male, "weight_kg": 82.5, "height_cm": 178.0, "care_setting": CareSettingEnum.ICU},
    {"mrn": "MRX-10002", "full_name": "Maria Santos", "age": 54, "sex": SexEnum.female, "weight_kg": 65.0, "height_cm": 162.0, "care_setting": CareSettingEnum.Ward},
    {"mrn": "MRX-10003", "full_name": "Robert Kim", "age": 72, "sex": SexEnum.male, "weight_kg": 90.0, "height_cm": 180.0, "care_setting": CareSettingEnum.ICU},
    {"mrn": "MRX-10004", "full_name": "Aisha Patel", "age": 45, "sex": SexEnum.female, "weight_kg": 58.0, "height_cm": 155.0, "care_setting": CareSettingEnum.ED},
    {"mrn": "MRX-10005", "full_name": "Thomas Chen", "age": 61, "sex": SexEnum.male, "weight_kg": 77.0, "height_cm": 172.0, "care_setting": CareSettingEnum.Ward},
    {"mrn": "MRX-10006", "full_name": "Elena Rodriguez", "age": 38, "sex": SexEnum.female, "weight_kg": 62.0, "height_cm": 167.0, "care_setting": CareSettingEnum.ED},
]


def _now_minus(minutes: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(minutes=minutes)


def _seed_patients(db: Session) -> list[Patient]:
    patients: list[Patient] = []
    now = datetime.now(timezone.utc)
    for p in _DEMO_PATIENTS:
        patient = Patient(
            patient_id=uuid.uuid4(),
            mrn=p["mrn"],
            full_name=p["full_name"],
            age=p["age"],
            sex=p["sex"],
            weight_kg=p["weight_kg"],
            height_cm=p["height_cm"],
            care_setting=p["care_setting"],
            admission_time=now - timedelta(hours=12),
        )
        db.add(patient)
        patients.append(patient)
    db.flush()
    return patients


def _seed_sepsis_prediction_logs(db: Session, patients: list[Patient]) -> None:
    configs = [
        {"idx": 0, "score": 0.92, "minutes_ago": 15, "status": "success"},
        {"idx": 2, "score": 0.85, "minutes_ago": 30, "status": "success"},
        {"idx": 4, "score": 0.78, "minutes_ago": 45, "status": "success"},
        {"idx": 1, "score": 0.42, "minutes_ago": 60, "status": "success"},
        {"idx": 3, "score": 0.25, "minutes_ago": 75, "status": "success"},
        {"idx": 5, "score": 0.15, "minutes_ago": 90, "status": "success"},
    ]
    for c in configs:
        patient = patients[c["idx"]]
        db.add(PredictionLog(
            id=uuid.uuid4(),
            patient_id=patient.patient_id,
            user_id=None,
            model_type="sepsis",
            model_version="1.2.0",
            input_payload={"vitals": {"hr": 110, "temp": 38.9, "sbp": 88}, "labs": {"wbc": 14.2, "lactate": 3.1}},
            output_payload={"risk_score": c["score"], "risk_level": "HIGH" if c["score"] >= 0.7 else "MODERATE" if c["score"] >= 0.4 else "LOW"},
            confidence_score=c["score"],
            latency_ms=round(45 + c["idx"] * 8.5, 1),
            status=c["status"],
            requested_at=_now_minus(c["minutes_ago"]),
        ))
    db.flush()


def _seed_clinical_alerts(db: Session, patients: list[Patient]) -> None:
    alerts = [
        {"idx": 0, "type": "sepsis", "severity": AlertSeverityEnum.critical, "title": "Sepsis risk: elevated lactate + tachycardia", "msg": "Patient James Carter: lactate 3.1 mmol/L, HR 110, temp 38.9C. qSOFA score 2.", "minutes_ago": 10},
        {"idx": 2, "type": "clinical_alert", "severity": AlertSeverityEnum.critical, "title": "Rapid deterioration: declining MAP", "msg": "Patient Robert Kim: MAP dropped from 72 to 58 mmHg over 2h. Vasopressor adjustment recommended.", "minutes_ago": 25},
        {"idx": 4, "type": "deterioration", "severity": AlertSeverityEnum.warning, "title": "Early warning: rising NEWS2 score", "msg": "Patient Thomas Chen: NEWS2 increased from 4 to 7 in last 4 hours.", "minutes_ago": 50},
        {"idx": 1, "type": "clinical_alert", "severity": AlertSeverityEnum.info, "title": "Routine vitals within range", "msg": "Patient Maria Santos: all vitals within normal limits at scheduled check.", "minutes_ago": 70},
    ]
    for a in alerts:
        patient = patients[a["idx"]]
        db.add(AlertLog(
            id=uuid.uuid4(),
            patient_id=patient.patient_id,
            user_id=None,
            alert_type=a["type"],
            severity=a["severity"],
            title=a["title"],
            message=a["msg"],
            status=AlertStatusEnum.open,
            triggered_at=_now_minus(a["minutes_ago"]),
        ))
    db.flush()


def _seed_medication_alerts(db: Session, patients: list[Patient]) -> None:
    med_alerts = [
        {"idx": 0, "severity": AlertSeverityEnum.critical, "title": "Warfarin-Amiodarone PK interaction", "msg": "interaction_class: PK; Warfarin clearance reduced by amiodarone. INR monitoring required.", "minutes_ago": 20},
        {"idx": 2, "severity": AlertSeverityEnum.critical, "title": "Fentanyl-Midazolam PD interaction", "msg": "interaction_class: PD; Combined respiratory depression risk. Reduce dose or monitor SpO2 continuously.", "minutes_ago": 35},
        {"idx": 1, "severity": AlertSeverityEnum.warning, "title": "Metformin renal dose adjustment", "msg": "eGFR 38 mL/min: metformin dose exceeds renal-adjusted recommendation.", "minutes_ago": 55},
        {"idx": 3, "severity": AlertSeverityEnum.warning, "title": "Ciprofloxacin-Theophylline interaction", "msg": "interaction_class: PK; Ciprofloxacin inhibits CYP1A2 — theophylline levels may rise.", "minutes_ago": 80},
        {"idx": 5, "severity": AlertSeverityEnum.info, "title": "Duplicate therapy detected", "msg": "Two NSAIDs prescribed concurrently: ibuprofen and naproxen.", "minutes_ago": 100},
    ]
    for m in med_alerts:
        patient = patients[m["idx"]]
        db.add(AlertLog(
            id=uuid.uuid4(),
            patient_id=patient.patient_id,
            user_id=None,
            alert_type="medication",
            severity=m["severity"],
            title=m["title"],
            message=m["msg"],
            status=AlertStatusEnum.open,
            triggered_at=_now_minus(m["minutes_ago"]),
        ))
    db.flush()


def _seed_ml_prediction_logs(db: Session) -> None:
    logs = [
        {
            "domain": "clinical",
            "name": "sepsis_risk_model",
            "version": "1.2.0",
            "type": "ml",
            "confidence": "HIGH",
            "minutes_ago": 12,
            "input": {"feature_count": 42, "patient_count": 6},
            "output": {"predictions_generated": 6, "high_risk_count": 3},
        },
        {
            "domain": "clinical",
            "name": "deterioration_early_warning",
            "version": "0.9.1",
            "type": "statistical",
            "confidence": "MEDIUM",
            "minutes_ago": 40,
            "input": {"feature_count": 28, "patient_count": 6},
            "output": {"predictions_generated": 6, "alerts_triggered": 1},
        },
        {
            "domain": "medication",
            "name": "drug_interaction_checker",
            "version": "2.1.0",
            "type": "hybrid",
            "confidence": "HIGH",
            "minutes_ago": 22,
            "input": {"medication_pairs_checked": 15},
            "output": {"interactions_found": 4, "critical_count": 2},
        },
    ]
    for lg in logs:
        db.add(MlPredictionLog(
            id=uuid.uuid4(),
            model_domain=lg["domain"],
            model_name=lg["name"],
            model_version=lg["version"],
            model_type=lg["type"],
            input_features_json=json.dumps(lg["input"]),
            output_predictions_json=json.dumps(lg["output"]),
            confidence_level=lg["confidence"],
            trace_id=str(uuid.uuid4()),
        ))
    db.flush()


def _seed_operations_forecast(db: Session) -> None:
    forecast_output = {
        "icu_occupancy_forecast_6h": {"point": 82.0, "lower": 76.0, "upper": 88.0},
        "icu_occupancy_forecast_24h": {"point": 85.0, "lower": 78.0, "upper": 92.0},
        "bed_occupancy_forecast_24h": {"point": 76.0, "lower": 70.0, "upper": 82.0},
        "ed_congestion_risk_probability": 0.55,
        "staffing_overload_probability": 0.72,
    }
    forecast_input = {
        "current_icu_census": 34,
        "current_total_census": 210,
        "ed_arrivals_last_4h": 18,
        "scheduled_discharges_24h": 12,
        "scheduled_surgeries_24h": 8,
    }
    db.add(MlPredictionLog(
        id=uuid.uuid4(),
        model_domain="operations",
        model_name="capacity_forecast",
        model_version="1.0.0",
        model_type="statistical",
        input_features_json=json.dumps(forecast_input),
        output_predictions_json=json.dumps(forecast_output),
        confidence_level="HIGH",
        trace_id=str(uuid.uuid4()),
    ))
    db.flush()


def seed_demo_data(db: Session) -> bool:
    existing = db.query(PredictionLog).first()
    if existing is not None:
        return False

    patients = _seed_patients(db)
    _seed_sepsis_prediction_logs(db, patients)
    _seed_clinical_alerts(db, patients)
    _seed_medication_alerts(db, patients)
    _seed_ml_prediction_logs(db)
    _seed_operations_forecast(db)
    db.commit()
    return True
