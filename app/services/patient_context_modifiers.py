from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set


@dataclass
class PatientContextInput:
    egfr: Optional[float] = None
    platelets: Optional[float] = None
    qtc_ms: Optional[float] = None
    age_years: Optional[int] = None
    weight_kg: Optional[float] = None
    is_pregnant: Optional[bool] = None
    creatinine_umol: Optional[float] = None
    inr: Optional[float] = None
    potassium_mmol: Optional[float] = None


@dataclass
class AppliedModifier:
    trigger: str
    threshold_description: str
    affected_alert_types: List[str]
    severity_escalated_to: str
    rationale: str


NEPHROTOXIC_DRUGS: Set[str] = {
    "vancomycin",
    "gentamicin",
    "tobramycin",
    "amikacin",
    "ciprofloxacin",
    "piperacillin-tazobactam",
    "ibuprofen",
    "naproxen",
    "diclofenac",
    "lisinopril",
    "ramipril",
    "enalapril",
    "losartan",
    "valsartan",
    "metformin",
    "cisplatin",
    "carboplatin",
    "furosemide",
    "cyclosporine",
    "tacrolimus",
}

QT_PROLONGING_DRUGS: Set[str] = {
    "amiodarone",
    "haloperidol",
    "ciprofloxacin",
    "levofloxacin",
    "moxifloxacin",
    "azithromycin",
    "clarithromycin",
    "erythromycin",
    "citalopram",
    "escitalopram",
    "fluoxetine",
    "methadone",
    "ondansetron",
    "quetiapine",
    "olanzapine",
    "risperidone",
    "droperidol",
    "sotalol",
}

BLEEDING_RISK_DRUGS: Set[str] = {
    "warfarin",
    "heparin",
    "enoxaparin",
    "dalteparin",
    "fondaparinux",
    "dabigatran",
    "rivaroxaban",
    "apixaban",
    "edoxaban",
    "aspirin",
    "clopidogrel",
    "ticagrelor",
    "prasugrel",
    "ibuprofen",
    "naproxen",
    "diclofenac",
    "abciximab",
    "eptifibatide",
    "tirofiban",
}

SEDATIVES_AND_OPIOIDS: Set[str] = {
    "morphine",
    "fentanyl",
    "oxycodone",
    "hydromorphone",
    "codeine",
    "tramadol",
    "buprenorphine",
    "methadone",
    "pethidine",
    "midazolam",
    "diazepam",
    "lorazepam",
    "clonazepam",
    "alprazolam",
    "propofol",
    "dexmedetomidine",
    "ketamine",
    "zolpidem",
    "temazepam",
}

TERATOGENIC_DRUGS: Set[str] = {
    "warfarin",
    "phenytoin",
    "valproate",
    "methotrexate",
    "lisinopril",
    "ramipril",
    "enalapril",
    "losartan",
    "valsartan",
    "irbesartan",
    "ibuprofen",
    "naproxen",
    "diclofenac",
    "tetracycline",
    "doxycycline",
    "isotretinoin",
    "thalidomide",
    "ciprofloxacin",
    "levofloxacin",
    "moxifloxacin",
    "lithium",
    "carbamazepine",
    "fluconazole",
    "misoprostol",
    "cyclophosphamide",
}

HYPERKALAEMIA_DRUGS: Set[str] = {
    "lisinopril",
    "ramipril",
    "enalapril",
    "losartan",
    "valsartan",
    "irbesartan",
    "spironolactone",
    "eplerenone",
    "potassium chloride",
    "trimethoprim",
    "heparin",
}


def _any_drug_in_set(canonical_drugs: List[str], drug_set: Set[str]) -> bool:
    return any(
        any(d == drug or drug in d or d in drug for drug in drug_set)
        for d in canonical_drugs
    )


def apply_context_modifiers(
    alerts: List[dict],
    canonical_drug_list: List[str],
    context: PatientContextInput,
) -> tuple[List[dict], List[str]]:
    """
    Returns (modified_alerts, context_flags).

    Each alert may have its severity escalated and will gain a
    context_modifiers_applied list documenting what changed and why.
    """
    context_flags: List[str] = []

    active_modifiers: List[Dict] = _compute_active_modifiers(canonical_drug_list, context, context_flags)

    if not active_modifiers:
        for alert in alerts:
            alert.setdefault("context_modifiers_applied", [])
        return alerts, context_flags

    for alert in alerts:
        alert.setdefault("context_modifiers_applied", [])
        alert_canonical = alert.get("canonical_drugs", [])
        alert_type = alert.get("type", "")
        interaction_class = alert.get("interaction_class", "")

        for modifier in active_modifiers:
            applies = False

            if modifier["scope"] == "nephrotoxic" and (
                interaction_class in ("PD", "PK")
                and "acute kidney injury" in alert.get("clinical_risk", "").lower()
            ):
                applies = True

            elif modifier["scope"] == "bleeding" and (
                "bleeding" in alert.get("clinical_risk", "").lower()
                or "haemorrhage" in alert.get("clinical_risk", "").lower()
                or "hemorrhage" in alert.get("clinical_risk", "").lower()
            ):
                applies = True

            elif modifier["scope"] == "qt" and interaction_class == "QT":
                applies = True

            elif modifier["scope"] == "qt_drug_present" and _any_drug_in_set(alert_canonical, QT_PROLONGING_DRUGS):
                applies = True

            elif modifier["scope"] == "sedation" and alert_type in (
                "drug_drug_interaction", "therapeutic_duplication"
            ) and _any_drug_in_set(alert_canonical, SEDATIVES_AND_OPIOIDS):
                applies = True

            elif modifier["scope"] == "teratogen" and _any_drug_in_set(alert_canonical, TERATOGENIC_DRUGS):
                applies = True

            elif modifier["scope"] == "hyperkalaemia" and (
                "hyperkalaemia" in alert.get("clinical_risk", "").lower()
                or "hyperkalemia" in alert.get("clinical_risk", "").lower()
            ):
                applies = True

            elif modifier["scope"] == "supratherapeutic_inr" and _any_drug_in_set(alert_canonical, {"warfarin"}):
                applies = True

            elif modifier["scope"] == "all":
                applies = True

            if applies and alert["severity"] != "CRITICAL":
                alert["severity"] = modifier["escalate_to"]
                alert["context_modifiers_applied"].append({
                    "trigger": modifier["trigger"],
                    "threshold_description": modifier["threshold_description"],
                    "affected_alert_types": [alert_type],
                    "severity_escalated_to": modifier["escalate_to"],
                    "rationale": modifier["rationale"],
                })

    return alerts, context_flags


def _compute_active_modifiers(
    canonical_drug_list: List[str],
    context: PatientContextInput,
    context_flags: List[str],
) -> List[Dict]:
    modifiers = []

    if context.egfr is not None and context.egfr < 30:
        context_flags.append(f"eGFR {context.egfr:.0f} mL/min — severe renal impairment (CKD stage 4–5)")
        if _any_drug_in_set(canonical_drug_list, NEPHROTOXIC_DRUGS):
            modifiers.append({
                "scope": "nephrotoxic",
                "trigger": "egfr_lt_30",
                "threshold_description": f"eGFR {context.egfr:.0f} mL/min/1.73m² (threshold: < 30)",
                "escalate_to": "CRITICAL",
                "rationale": "Severely impaired renal clearance amplifies nephrotoxin accumulation and AKI risk",
            })

    if context.egfr is not None and context.egfr < 30 and _any_drug_in_set(canonical_drug_list, HYPERKALAEMIA_DRUGS):
        modifiers.append({
            "scope": "hyperkalaemia",
            "trigger": "egfr_lt_30_hyperkalaemia_drug",
            "threshold_description": f"eGFR {context.egfr:.0f} mL/min/1.73m² with hyperkalaemia-promoting drug",
            "escalate_to": "CRITICAL",
            "rationale": "CKD stage 4–5 impairs potassium excretion; hyperkalaemia risk is substantially increased",
        })

    if context.potassium_mmol is not None and context.potassium_mmol > 5.5:
        context_flags.append(f"Serum K⁺ {context.potassium_mmol:.1f} mmol/L — hyperkalaemia present")
        if _any_drug_in_set(canonical_drug_list, HYPERKALAEMIA_DRUGS):
            modifiers.append({
                "scope": "hyperkalaemia",
                "trigger": "hyperkalaemia_present",
                "threshold_description": f"Serum K⁺ {context.potassium_mmol:.1f} mmol/L (threshold: > 5.5)",
                "escalate_to": "CRITICAL",
                "rationale": "Pre-existing hyperkalaemia combined with potassium-retaining drugs risks fatal arrhythmia",
            })

    if context.platelets is not None and context.platelets < 50:
        context_flags.append(f"Platelets {context.platelets:.0f} × 10⁹/L — severe thrombocytopaenia")
        if _any_drug_in_set(canonical_drug_list, BLEEDING_RISK_DRUGS):
            modifiers.append({
                "scope": "bleeding",
                "trigger": "platelets_lt_50",
                "threshold_description": f"Platelet count {context.platelets:.0f} × 10⁹/L (threshold: < 50)",
                "escalate_to": "CRITICAL",
                "rationale": "Severe thrombocytopaenia removes the primary platelet plug; anticoagulant/antiplatelet drugs cause disproportionate bleeding",
            })

    if context.qtc_ms is not None and context.qtc_ms > 500:
        context_flags.append(f"QTc {context.qtc_ms:.0f} ms — critically prolonged (> 500 ms)")
        modifiers.append({
            "scope": "qt",
            "trigger": "qtc_gt_500",
            "threshold_description": f"QTc {context.qtc_ms:.0f} ms (threshold: > 500 ms)",
            "escalate_to": "CRITICAL",
            "rationale": "QTc > 500 ms is the accepted threshold above which Torsades de pointes risk is substantially elevated",
        })
        modifiers.append({
            "scope": "qt_drug_present",
            "trigger": "qtc_gt_500_with_qt_drug",
            "threshold_description": f"QTc {context.qtc_ms:.0f} ms with QT-prolonging agent in regimen",
            "escalate_to": "CRITICAL",
            "rationale": "Any QT-prolonging drug should be considered critical when baseline QTc already exceeds 500 ms",
        })

    elif context.qtc_ms is not None and context.qtc_ms > 480:
        context_flags.append(f"QTc {context.qtc_ms:.0f} ms — prolonged (> 480 ms)")

    if context.age_years is not None and context.age_years > 75:
        context_flags.append(f"Age {context.age_years} years — elderly patient (> 75)")
        if _any_drug_in_set(canonical_drug_list, SEDATIVES_AND_OPIOIDS):
            modifiers.append({
                "scope": "sedation",
                "trigger": "age_gt_75",
                "threshold_description": f"Age {context.age_years} years (threshold: > 75)",
                "escalate_to": "CRITICAL",
                "rationale": "Elderly patients have reduced hepatic/renal clearance and increased CNS sensitivity — sedatives and opioids carry elevated risk of respiratory depression and delirium",
            })

    if context.is_pregnant is True:
        context_flags.append("Pregnancy confirmed — teratogen screening active")
        if _any_drug_in_set(canonical_drug_list, TERATOGENIC_DRUGS):
            modifiers.append({
                "scope": "teratogen",
                "trigger": "pregnancy_confirmed",
                "threshold_description": "Pregnancy status: confirmed",
                "escalate_to": "CRITICAL",
                "rationale": "Confirmed pregnancy — teratogenic or foetotoxic drug present in regimen; risk of foetal harm is clinically unacceptable",
            })

    if context.inr is not None and context.inr > 3.5:
        context_flags.append(f"INR {context.inr:.1f} — supratherapeutic anticoagulation")
        modifiers.append({
            "scope": "supratherapeutic_inr",
            "trigger": "inr_gt_3_5",
            "threshold_description": f"INR {context.inr:.1f} (threshold: > 3.5)",
            "escalate_to": "CRITICAL",
            "rationale": "Supratherapeutic INR significantly amplifies haemorrhagic risk of any co-interacting drug",
        })

    return modifiers
