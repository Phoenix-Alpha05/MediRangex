from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.session import get_db
from app.schemas.patient import PatientResponse, PatientCreate
from app.services.patient_service import get_patient, create_patient
from app.auth.rbac import require_any_role
from app.models.user import User

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.get("/{patient_id}", response_model=PatientResponse)
def fetch_patient(
    patient_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_role),
):
    return get_patient(db, patient_id)


@router.post("/", response_model=PatientResponse, status_code=201)
def add_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_any_role),
):
    return create_patient(db, payload)
