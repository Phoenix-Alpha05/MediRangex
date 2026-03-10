from datetime import datetime, timezone
from typing import List, Tuple

ENGINE_VERSION = "ops_rules_v2"

RISK_ORDER = ["LOW", "MODERATE", "HIGH", "CRITICAL"]


def _escalate(level: str) -> str:
    idx = RISK_ORDER.index(level)
    return RISK_ORDER[min(idx + 1, len(RISK_ORDER) - 1)]


def _assess_icu_capacity(icu_occupancy_percent: float) -> Tuple[str, List[str], List[str]]:
    factors: List[str] = []
    actions: List[str] = []

    if icu_occupancy_percent >= 95:
        risk = "CRITICAL"
        factors.append(f"ICU occupancy at {icu_occupancy_percent}% (threshold: ≥95%)")
        actions.append("Activate surge capacity protocol")
        actions.append("Initiate inter-hospital transfers")
    elif icu_occupancy_percent >= 85:
        risk = "HIGH"
        factors.append(f"ICU occupancy at {icu_occupancy_percent}% (threshold: 85–94%)")
        actions.append("Open overflow beds")
        actions.append("Activate surge capacity protocol")
    elif icu_occupancy_percent >= 70:
        risk = "MODERATE"
        factors.append(f"ICU occupancy at {icu_occupancy_percent}% (threshold: 70–84%)")
        actions.append("Open overflow beds")
    else:
        risk = "LOW"

    return risk, factors, actions


def _assess_total_bed_capacity(total_bed_occupancy_percent: float) -> Tuple[str, List[str], List[str]]:
    factors: List[str] = []
    actions: List[str] = []

    if total_bed_occupancy_percent >= 98:
        risk = "CRITICAL"
        factors.append(f"Total bed occupancy at {total_bed_occupancy_percent}% (threshold: ≥98%)")
        actions.append("Activate surge capacity protocol")
        actions.append("Defer elective surgeries")
        actions.append("Initiate inter-hospital transfers")
    elif total_bed_occupancy_percent >= 90:
        risk = "HIGH"
        factors.append(f"Total bed occupancy at {total_bed_occupancy_percent}% (threshold: 90–97%)")
        actions.append("Open overflow beds")
        actions.append("Defer elective surgeries")
    elif total_bed_occupancy_percent >= 80:
        risk = "MODERATE"
        factors.append(f"Total bed occupancy at {total_bed_occupancy_percent}% (threshold: 80–89%)")
        actions.append("Open overflow beds")
    else:
        risk = "LOW"

    return risk, factors, actions


def _assess_ed_congestion(
    ed_waiting_patients: int,
    ed_boarding_patients: int,
) -> Tuple[str, List[str], List[str]]:
    factors: List[str] = []
    actions: List[str] = []
    total = ed_waiting_patients + ed_boarding_patients

    if total >= 40:
        risk = "CRITICAL"
        factors.append(
            f"ED patient load at {total} (waiting={ed_waiting_patients}, "
            f"boarding={ed_boarding_patients}; threshold: ≥40)"
        )
        actions.append("Activate surge capacity protocol")
        actions.append("Open overflow beds")
        actions.append("Initiate inter-hospital transfers")
    elif total >= 25:
        risk = "HIGH"
        factors.append(
            f"ED patient load at {total} (waiting={ed_waiting_patients}, "
            f"boarding={ed_boarding_patients}; threshold: ≥25)"
        )
        actions.append("Open overflow beds")
        actions.append("Defer elective surgeries")
    elif total >= 15:
        risk = "MODERATE"
        factors.append(
            f"ED patient load at {total} (waiting={ed_waiting_patients}, "
            f"boarding={ed_boarding_patients}; threshold: ≥15)"
        )
        actions.append("Defer elective surgeries")
    else:
        risk = "LOW"

    return risk, factors, actions


def _assess_ventilator_capacity(ventilator_utilization_percent: float) -> Tuple[str, List[str], List[str]]:
    factors: List[str] = []
    actions: List[str] = []

    if ventilator_utilization_percent >= 90:
        risk = "CRITICAL"
        factors.append(f"Ventilator utilization at {ventilator_utilization_percent}% (threshold: ≥90%)")
        actions.append("Initiate inter-hospital transfers")
        actions.append("Activate surge capacity protocol")
    elif ventilator_utilization_percent >= 75:
        risk = "HIGH"
        factors.append(f"Ventilator utilization at {ventilator_utilization_percent}% (threshold: ≥75%)")
        actions.append("Activate surge capacity protocol")
    elif ventilator_utilization_percent >= 60:
        risk = "MODERATE"
        factors.append(f"Ventilator utilization at {ventilator_utilization_percent}% (threshold: ≥60%)")
    else:
        risk = "LOW"

    return risk, factors, actions


def _assess_staffing_strain(
    patients_per_nurse: float,
    admissions_last_6h: int,
    discharges_last_6h: int,
) -> Tuple[str, List[str], List[str]]:
    """
    patients_per_nurse: number of patients assigned per nurse.
    e.g. 4.0 = 1 nurse covers 4 patients (ratio 1:4).
    Higher value = worse staffing.
    """
    factors: List[str] = []
    actions: List[str] = []

    if patients_per_nurse >= 4:
        risk = "CRITICAL"
        factors.append(
            f"Nurse load at {patients_per_nurse:.1f} patients/nurse "
            f"(≥1:4 threshold; unsafe staffing)"
        )
        actions.append("Call backup staffing pool")
        actions.append("Activate surge capacity protocol")
    elif patients_per_nurse >= 3:
        risk = "HIGH"
        factors.append(
            f"Nurse load at {patients_per_nurse:.1f} patients/nurse "
            f"(≥1:3 threshold)"
        )
        actions.append("Call backup staffing pool")
    elif patients_per_nurse >= 2:
        risk = "MODERATE"
        factors.append(
            f"Nurse load at {patients_per_nurse:.1f} patients/nurse "
            f"(≥1:2 threshold)"
        )
    else:
        risk = "LOW"

    admission_pressure = (
        discharges_last_6h > 0
        and ((admissions_last_6h - discharges_last_6h) / discharges_last_6h) > 0.2
    )
    if admission_pressure:
        risk = _escalate(risk)
        factors.append(
            f"Admission pressure: (admissions={admissions_last_6h} − discharges={discharges_last_6h}) "
            f"/ discharges > 20% → severity escalated one level"
        )
        if "Call backup staffing pool" not in actions:
            actions.append("Call backup staffing pool")

    return risk, factors, actions


def _derive_system_status(domain_risks: List[str]) -> str:
    critical_count = sum(1 for r in domain_risks if r == "CRITICAL")
    high_or_above_count = sum(1 for r in domain_risks if r in ("HIGH", "CRITICAL"))

    if critical_count >= 2:
        return "SURGE"
    if high_or_above_count >= 2:
        return "STRAINED"
    return "NORMAL"


def _compound_surge_alerts(domain_risks: List[str]) -> List[str]:
    high_count = sum(1 for r in domain_risks if r == "HIGH")
    critical_count = sum(1 for r in domain_risks if r == "CRITICAL")
    alerts: List[str] = []

    if critical_count >= 2:
        alerts.append("Hospital surge state")
    elif high_count + critical_count >= 2:
        alerts.append("System-wide capacity strain")

    return alerts


def run_operations_forecast(
    timestamp: datetime,
    icu_occupancy_percent: float,
    total_bed_occupancy_percent: float,
    ed_waiting_patients: int,
    ed_boarding_patients: int,
    ventilator_utilization_percent: float,
    nurse_patient_ratio: float,
    admissions_last_6h: int,
    discharges_last_6h: int,
    elective_surgeries_next_24h: int,
) -> dict:
    icu_risk, icu_factors, icu_actions = _assess_icu_capacity(icu_occupancy_percent)
    bed_risk, bed_factors, bed_actions = _assess_total_bed_capacity(total_bed_occupancy_percent)
    ed_risk, ed_factors, ed_actions = _assess_ed_congestion(ed_waiting_patients, ed_boarding_patients)
    vent_risk, vent_factors, vent_actions = _assess_ventilator_capacity(ventilator_utilization_percent)
    staff_risk, staff_factors, staff_actions = _assess_staffing_strain(
        nurse_patient_ratio, admissions_last_6h, discharges_last_6h
    )

    domain_risks = [icu_risk, bed_risk, ed_risk, vent_risk, staff_risk]

    elective_actions: List[str] = []
    if elective_surgeries_next_24h > 0 and any(r in ("HIGH", "CRITICAL") for r in domain_risks):
        elective_actions.append(
            f"Defer elective surgeries ({elective_surgeries_next_24h} scheduled in next 24h)"
        )

    triggered_factors = icu_factors + bed_factors + ed_factors + vent_factors + staff_factors

    domain_alerts: List[str] = []
    if icu_factors:
        domain_alerts.append("ICU saturation risk")
    if bed_factors:
        domain_alerts.append("Total bed capacity critical")
    if ed_factors:
        domain_alerts.append("ED boarding crisis")
    if vent_factors:
        domain_alerts.append("Ventilator fleet near exhaustion")
    if staff_factors:
        domain_alerts.append("Unsafe nurse staffing ratio")

    system_status = _derive_system_status(domain_risks)
    compound_alerts = _compound_surge_alerts(domain_risks)
    operational_alerts = domain_alerts + compound_alerts

    all_actions: List[str] = []
    seen_actions: set = set()
    for action in icu_actions + bed_actions + ed_actions + vent_actions + staff_actions + elective_actions:
        if action not in seen_actions:
            all_actions.append(action)
            seen_actions.add(action)

    return {
        "system_status": system_status,
        "icu_capacity_risk": icu_risk,
        "total_bed_capacity_risk": bed_risk,
        "ed_congestion_risk": ed_risk,
        "ventilator_capacity_risk": vent_risk,
        "staffing_strain_risk": staff_risk,
        "triggered_factors": triggered_factors,
        "operational_alerts": operational_alerts,
        "recommended_actions": all_actions,
        "engine_version": ENGINE_VERSION,
        "evaluated_at": datetime.now(timezone.utc),
    }
