import re
from itertools import combinations
from typing import List, Optional, Set, Tuple
from uuid import UUID

from app.services.drug_safety_kb import (
    ENGINE_VERSION,
    ABSOLUTE_CONTRAINDICATIONS,
    ANTIMICROBIAL_COVERAGE_CLASSES,
    ANTICOAGULANTS,
    APINCH_CLASSES,
    CRITICAL_CONSEQUENCE_KEYWORDS,
    INTERACTION_PAIRS,
    ONTOLOGY_SYNONYMS,
    OPIOIDS,
    SEDATIVES,
)
from app.services.patient_context_modifiers import PatientContextInput, apply_context_modifiers


def _strip_dose(name: str) -> str:
    return re.sub(r"\s*\d+\s*(mg|mcg|µg|ug|ml|g|unit|units|iu|mmol|mEq)\b.*", "", name, flags=re.IGNORECASE).strip()


def normalise_drug_name(raw: str) -> Tuple[str, str]:
    cleaned = _strip_dose(raw.lower().strip())

    if cleaned in ONTOLOGY_SYNONYMS:
        return ONTOLOGY_SYNONYMS[cleaned], cleaned

    for synonym, canonical in ONTOLOGY_SYNONYMS.items():
        if synonym in cleaned:
            return canonical, cleaned

    return cleaned, cleaned


def _compute_severity(consequence: str, declared: Optional[str] = None) -> str:
    lower = consequence.lower()
    for kw in CRITICAL_CONSEQUENCE_KEYWORDS:
        if kw in lower:
            return "CRITICAL"
    if declared == "CRITICAL":
        return "CRITICAL"
    return "WARNING"


def _canonical_matches(canonical: str, kb_term: str) -> bool:
    return canonical == kb_term or kb_term in canonical or canonical in kb_term


def _any_canonical_matches(canonical: str, candidates: Set[str]) -> bool:
    return any(_canonical_matches(canonical, c) for c in candidates)


def _check_drug_drug_interactions(
    drug_entries: List[Tuple[str, str, str]],
) -> List[dict]:
    alerts = []
    for (raw_a, canonical_a, _), (raw_b, canonical_b, _) in combinations(drug_entries, 2):
        for pair in INTERACTION_PAIRS:
            kb_list = list(pair["drugs"])
            if len(kb_list) != 2:
                continue
            left, right = kb_list[0], kb_list[1]
            match = (
                (_canonical_matches(canonical_a, left) and _canonical_matches(canonical_b, right))
                or (_canonical_matches(canonical_a, right) and _canonical_matches(canonical_b, left))
            )
            if match:
                severity = _compute_severity(pair["consequence"], pair.get("severity"))
                alerts.append({
                    "type": "drug_drug_interaction",
                    "severity": severity,
                    "drugs": [raw_a, raw_b],
                    "canonical_drugs": [canonical_a, canonical_b],
                    "mechanism": pair["mechanism"],
                    "clinical_risk": pair["consequence"],
                    "interaction_class": pair.get("interaction_class", "PD"),
                    "confidence_level": pair.get("confidence_level", "MODERATE"),
                    "evidence_source": pair.get("evidence_source", "literature"),
                    "recommendation": "; ".join(pair["actions"]),
                    "_actions": pair["actions"],
                })
    return alerts


def _check_contraindications(
    drug_entries: List[Tuple[str, str, str]],
    conditions: List[str],
) -> List[dict]:
    if not conditions:
        return []

    alerts = []
    normalised_conditions = {c.lower().strip() for c in conditions}

    for rule in ABSOLUTE_CONTRAINDICATIONS:
        for raw, canonical, _ in drug_entries:
            if not _canonical_matches(canonical, rule["drug"]):
                continue
            matched_conditions = normalised_conditions & {c.lower() for c in rule["conditions"]}
            if matched_conditions:
                alerts.append({
                    "type": "contraindication",
                    "severity": "CRITICAL",
                    "drugs": [raw],
                    "canonical_drugs": [canonical],
                    "mechanism": f"Absolute contraindication: {rule['drug']} contraindicated in {', '.join(matched_conditions)}",
                    "clinical_risk": rule["risk"],
                    "interaction_class": "PD",
                    "confidence_level": "HIGH",
                    "evidence_source": "guideline",
                    "recommendation": rule["action"],
                    "_actions": [rule["action"]],
                })
    return alerts


def _check_therapeutic_duplication(
    drug_entries: List[Tuple[str, str, str]],
) -> List[dict]:
    alerts = []

    matched_anticoagulants = [
        (raw, can) for raw, can, _ in drug_entries
        if _any_canonical_matches(can, ANTICOAGULANTS)
    ]
    if len(matched_anticoagulants) >= 2:
        raws = [r for r, _ in matched_anticoagulants]
        cans = [c for _, c in matched_anticoagulants]
        alerts.append({
            "type": "therapeutic_duplication",
            "severity": "CRITICAL",
            "drugs": raws,
            "canonical_drugs": cans,
            "mechanism": "Dual anticoagulation — multiple anticoagulants prescribed concurrently",
            "clinical_risk": "Major bleeding risk from additive anticoagulation",
            "interaction_class": "PD",
            "confidence_level": "HIGH",
            "evidence_source": "guideline",
            "recommendation": "Review therapeutic intent; prescribe only one anticoagulant unless under specialist guidance",
            "_actions": ["Review and rationalise anticoagulant regimen", "Confirm therapeutic intent with prescriber"],
        })

    for coverage_class, members in ANTIMICROBIAL_COVERAGE_CLASSES.items():
        matched = [
            (raw, can) for raw, can, _ in drug_entries
            if _any_canonical_matches(can, members)
        ]
        if len(matched) >= 2:
            alerts.append({
                "type": "therapeutic_duplication",
                "severity": "WARNING",
                "drugs": [r for r, _ in matched],
                "canonical_drugs": [c for _, c in matched],
                "mechanism": f"Duplicate antimicrobials — two or more {coverage_class}s prescribed",
                "clinical_risk": "Overlapping spectrum without added benefit; increased adverse effect risk",
                "interaction_class": "PD",
                "confidence_level": "HIGH",
                "evidence_source": "guideline",
                "recommendation": f"Review indication; use a single {coverage_class} unless dual-therapy protocol applies",
                "_actions": [f"Rationalise antimicrobial therapy to single {coverage_class}"],
            })

    matched_sedatives = [
        (raw, can) for raw, can, _ in drug_entries
        if _any_canonical_matches(can, SEDATIVES)
    ]
    if len(matched_sedatives) >= 2:
        alerts.append({
            "type": "therapeutic_duplication",
            "severity": "CRITICAL",
            "drugs": [r for r, _ in matched_sedatives],
            "canonical_drugs": [c for _, c in matched_sedatives],
            "mechanism": "Sedative stacking — multiple CNS depressants prescribed concurrently",
            "clinical_risk": "Respiratory depression and oversedation",
            "interaction_class": "PD",
            "confidence_level": "HIGH",
            "evidence_source": "guideline",
            "recommendation": "Rationalise sedation; use sedation scoring (e.g. RASS); avoid polypharmacy sedation outside ICU protocols",
            "_actions": [
                "Review sedation requirement",
                "Rationalise to single agent where possible",
                "Monitor sedation depth with validated scoring tool",
            ],
        })

    matched_opioids = [
        (raw, can) for raw, can, _ in drug_entries
        if _any_canonical_matches(can, OPIOIDS)
    ]
    if len(matched_opioids) >= 2:
        alerts.append({
            "type": "therapeutic_duplication",
            "severity": "CRITICAL",
            "drugs": [r for r, _ in matched_opioids],
            "canonical_drugs": [c for _, c in matched_opioids],
            "mechanism": "PRN opioid duplication — multiple opioid analgesics prescribed concurrently",
            "clinical_risk": "Respiratory depression, oversedation, and opioid toxicity",
            "interaction_class": "PD",
            "confidence_level": "HIGH",
            "evidence_source": "guideline",
            "recommendation": "Review opioid regimen; prescribe a single opioid with appropriate dose titration",
            "_actions": [
                "Rationalise to single opioid agent",
                "Ensure rescue doses are clearly differentiated from regular dosing",
            ],
        })

    return alerts


def _check_high_alert_medications(
    drug_entries: List[Tuple[str, str, str]],
) -> List[dict]:
    alerts = []
    for raw, canonical, _ in drug_entries:
        for apinch_class, members in APINCH_CLASSES.items():
            if _any_canonical_matches(canonical, members):
                alerts.append({
                    "type": "high_alert_medication",
                    "severity": "WARNING",
                    "drugs": [raw],
                    "canonical_drugs": [canonical],
                    "mechanism": f"APINCH high-alert medication class: {apinch_class}",
                    "clinical_risk": "High-alert medications carry a heightened risk of causing significant patient harm if used in error",
                    "interaction_class": "PD",
                    "confidence_level": "HIGH",
                    "evidence_source": "guideline",
                    "recommendation": "Apply double-check procedures; verify dose, route, rate, and patient identity before administration",
                    "_actions": [
                        "Independent double-check by second nurse/pharmacist before administration",
                        "Verify dose against weight-based or renal-adjusted guidelines",
                        "Confirm correct concentration and infusion rate where applicable",
                    ],
                })
    return alerts


def _deduplicate_alerts(alerts: List[dict]) -> List[dict]:
    seen: Set[tuple] = set()
    unique = []
    for alert in alerts:
        key = (alert["type"], frozenset(alert.get("canonical_drugs", alert["drugs"])), alert["mechanism"])
        if key not in seen:
            seen.add(key)
            unique.append(alert)
    return unique


def _collect_recommended_actions(alerts: List[dict]) -> List[str]:
    seen: Set[str] = set()
    actions = []
    for alert in alerts:
        for action in alert.get("_actions", []):
            if action not in seen:
                seen.add(action)
                actions.append(action)
    return actions


def run_drug_safety_check(
    patient_id: UUID,
    drug_names: List[str],
    patient_conditions: Optional[List[str]] = None,
    patient_context: Optional[PatientContextInput] = None,
) -> dict:
    conditions = patient_conditions or []

    drug_entries: List[Tuple[str, str, str]] = [
        (raw, canonical, cleaned)
        for raw in drug_names
        for canonical, cleaned in [normalise_drug_name(raw)]
    ]

    all_alerts: List[dict] = []
    all_alerts.extend(_check_drug_drug_interactions(drug_entries))
    all_alerts.extend(_check_contraindications(drug_entries, conditions))
    all_alerts.extend(_check_therapeutic_duplication(drug_entries))
    all_alerts.extend(_check_high_alert_medications(drug_entries))

    all_alerts = _deduplicate_alerts(all_alerts)

    context_flags: List[str] = []
    if patient_context is not None:
        canonical_drug_list = [canonical for _, canonical, _ in drug_entries]
        all_alerts, context_flags = apply_context_modifiers(all_alerts, canonical_drug_list, patient_context)

    recommended_actions = _collect_recommended_actions(all_alerts)

    critical_count = sum(1 for a in all_alerts if a["severity"] == "CRITICAL")
    warning_count = sum(1 for a in all_alerts if a["severity"] == "WARNING")

    clean_alerts = [
        {k: v for k, v in alert.items() if k != "_actions"}
        for alert in all_alerts
    ]

    return {
        "patient_id": patient_id,
        "alerts": clean_alerts,
        "summary": {
            "total_alerts": len(all_alerts),
            "critical": critical_count,
            "warnings": warning_count,
        },
        "recommended_actions": recommended_actions,
        "engine_version": ENGINE_VERSION,
        "context_flags": context_flags,
    }
