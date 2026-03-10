from dataclasses import dataclass, field
from typing import List, Optional
from app.models.patient import CareSettingEnum

ENGINE_VERSION = "rule-based-v1.0"

SIRS_TEMP_HIGH = 38.0
SIRS_TEMP_LOW = 36.0
SIRS_HR_THRESHOLD = 90
SIRS_RR_THRESHOLD = 22

HYPOPERFUSION_SBP_THRESHOLD = 100
HYPOPERFUSION_LACTATE_THRESHOLD = 2.0

HIGH_SEVERITY_SBP = 90
HIGH_SEVERITY_LACTATE = 4.0

SIRS_SCORE_WEIGHT = 1
HYPOPERFUSION_SCORE_WEIGHT = 2
ICU_CONTEXT_WEIGHT = 2

RISK_THRESHOLDS = {
    "Low": (0, 2),
    "Moderate": (3, 4),
    "High": (5, 6),
    "Critical": (7, 99),
}

RECOMMENDED_ACTIONS = {
    "Low": [
        "Continue routine vital sign monitoring",
        "Reassess in 4-6 hours",
        "Maintain current care plan",
    ],
    "Moderate": [
        "Increase vital sign frequency to every 2 hours",
        "Obtain blood cultures if infection suspected",
        "Review fluid status and urine output",
        "Alert senior clinician if deterioration observed",
    ],
    "High": [
        "Initiate sepsis protocol immediately",
        "Administer broad-spectrum antibiotics within 1 hour",
        "Begin IV fluid resuscitation (30mL/kg crystalloid)",
        "Obtain blood cultures x2 before antibiotics",
        "Continuous hemodynamic monitoring",
        "Request urgent senior review",
    ],
    "Critical": [
        "Activate critical care response team",
        "Initiate sepsis protocol immediately",
        "Administer broad-spectrum antibiotics within 1 hour",
        "Begin aggressive IV fluid resuscitation",
        "Obtain blood cultures x2 before antibiotics",
        "Consider vasopressor therapy if refractory hypotension",
        "Arrange ICU/HDU transfer",
        "Continuous arterial line monitoring",
        "Repeat lactate in 2 hours",
    ],
}


@dataclass
class SepsisEngineResult:
    risk_score_raw: int
    risk_level: str
    time_to_deterioration: str
    triggered_factors: List[str]
    clinical_rationale: str
    recommended_actions: List[str]
    engine_version: str = ENGINE_VERSION


def _classify_risk(score: int) -> str:
    for level, (low, high) in RISK_THRESHOLDS.items():
        if low <= score <= high:
            return level
    return "Critical"


def _estimate_deterioration(
    risk_level: str,
    systolic_bp: float,
    lactate: Optional[float],
) -> str:
    if lactate is not None and lactate >= HIGH_SEVERITY_LACTATE:
        return "High risk within 6 hours"
    if systolic_bp < HIGH_SEVERITY_SBP:
        return "High risk within 6 hours"
    if risk_level in ("High", "Critical"):
        return "High risk within 6 hours"
    if risk_level == "Moderate":
        return "Monitor 12-24 hours"
    return "Routine monitoring"


def _build_rationale(triggered_factors: List[str], risk_level: str) -> str:
    if not triggered_factors:
        return (
            f"No significant sepsis criteria met. Risk classified as {risk_level}. "
            "Continue standard monitoring per care plan."
        )

    factor_text = ", ".join(triggered_factors[:-1])
    if len(triggered_factors) > 1:
        factor_text += f" and {triggered_factors[-1]}"
    else:
        factor_text = triggered_factors[0]

    rationale_map = {
        "Low": (
            f"Findings include {factor_text}. Criteria do not yet meet sepsis threshold. "
            "Clinical vigilance and reassessment are recommended."
        ),
        "Moderate": (
            f"Findings include {factor_text}, indicating early systemic inflammatory response. "
            "Consider active monitoring and escalation readiness per sepsis bundle."
        ),
        "High": (
            f"Findings meet systemic inflammatory and hypoperfusion criteria consistent with "
            f"evolving sepsis: {factor_text}. Immediate sepsis protocol activation is indicated."
        ),
        "Critical": (
            f"Findings indicate critical sepsis or septic shock: {factor_text}. "
            "Multi-organ dysfunction risk is elevated. Immediate critical care escalation required."
        ),
    }
    return rationale_map.get(risk_level, f"Sepsis criteria met: {factor_text}.")


def evaluate_sepsis_risk(
    heart_rate: float,
    respiratory_rate: float,
    temperature_celsius: float,
    systolic_bp: float,
    care_setting: CareSettingEnum,
    lactate: Optional[float] = None,
) -> SepsisEngineResult:
    score = 0
    triggered_factors: List[str] = []

    if temperature_celsius > SIRS_TEMP_HIGH or temperature_celsius < SIRS_TEMP_LOW:
        score += SIRS_SCORE_WEIGHT
        direction = "Hyperthermia" if temperature_celsius > SIRS_TEMP_HIGH else "Hypothermia"
        triggered_factors.append(f"{direction} ({temperature_celsius:.1f}°C)")

    if heart_rate > SIRS_HR_THRESHOLD:
        score += SIRS_SCORE_WEIGHT
        triggered_factors.append(f"Tachycardia ({heart_rate:.0f} bpm)")

    if respiratory_rate > SIRS_RR_THRESHOLD:
        score += SIRS_SCORE_WEIGHT
        triggered_factors.append(f"Tachypnea ({respiratory_rate:.0f} breaths/min)")

    if systolic_bp < HYPOPERFUSION_SBP_THRESHOLD:
        score += HYPOPERFUSION_SCORE_WEIGHT
        triggered_factors.append(f"Hypotension (SBP {systolic_bp:.0f} mmHg)")

    if lactate is not None and lactate >= HYPOPERFUSION_LACTATE_THRESHOLD:
        score += HYPOPERFUSION_SCORE_WEIGHT
        triggered_factors.append(f"Elevated lactate ({lactate:.1f} mmol/L)")

    if care_setting == CareSettingEnum.icu:
        score += ICU_CONTEXT_WEIGHT
        triggered_factors.append("ICU high-acuity care setting")

    risk_level = _classify_risk(score)
    time_to_deterioration = _estimate_deterioration(risk_level, systolic_bp, lactate)
    clinical_rationale = _build_rationale(triggered_factors, risk_level)
    recommended_actions = RECOMMENDED_ACTIONS[risk_level]

    return SepsisEngineResult(
        risk_score_raw=score,
        risk_level=risk_level,
        time_to_deterioration=time_to_deterioration,
        triggered_factors=triggered_factors,
        clinical_rationale=clinical_rationale,
        recommended_actions=recommended_actions,
    )
