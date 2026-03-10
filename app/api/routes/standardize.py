from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from app.schemas.standardize import ClinicalCodeRequest, ClinicalCodeResponse, StandardizedCode
from app.auth.rbac import require_any_role
from app.models.user import User

router = APIRouter(prefix="/standardize", tags=["Code Standardization"])


@router.post("/clinical-codes", response_model=ClinicalCodeResponse)
def standardize_clinical_codes(
    request: ClinicalCodeRequest,
    _: User = Depends(require_any_role),
):
    stub_results: list[StandardizedCode] = []

    code_map = {
        "LOINC": ("8480-6", "Systolic blood pressure", "http://loinc.org", "2.76"),
        "SNOMED": ("38341003", "Hypertensive disorder", "http://snomed.info/sct", "20230901"),
        "ICD-10": ("I10", "Essential (primary) hypertension", "http://hl7.org/fhir/sid/icd-10", "2024"),
        "RxNorm": ("1049502", "12 HR oxycodone", "http://www.nlm.nih.gov/research/umls/rxnorm", "2024AB"),
    }

    system_upper = request.code_system.upper()
    if system_upper in code_map:
        code, display, system, version = code_map[system_upper]
        stub_results.append(
            StandardizedCode(
                code=code,
                display=display,
                system=system,
                version=version,
                confidence=0.89,
                match_type="semantic",
            )
        )

    return ClinicalCodeResponse(
        original_text=request.raw_text,
        code_system=request.code_system,
        results=stub_results,
        total_matches=len(stub_results),
        processed_at=datetime.now(timezone.utc).isoformat(),
    )
