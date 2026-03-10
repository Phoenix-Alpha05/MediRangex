from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.patient import Patient
from app.schemas.patient import PatientCreate


def get_patient(db: Session, patient_id: UUID) -> Patient:
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient {patient_id} not found",
        )
    return patient


def create_patient(db: Session, payload: PatientCreate) -> Patient:
    existing = db.query(Patient).filter(Patient.mrn == payload.mrn).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Patient with MRN '{payload.mrn}' already exists",
        )
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
