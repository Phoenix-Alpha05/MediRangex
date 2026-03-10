from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.patient import SexEnum, CareSettingEnum


class PatientResponse(BaseModel):
    model_config = {"from_attributes": True}

    patient_id: UUID
    mrn: str
    full_name: str
    age: Optional[int] = None
    sex: SexEnum
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    admission_time: Optional[datetime] = None
    care_setting: Optional[CareSettingEnum] = None
    created_at: datetime
    updated_at: datetime


class PatientCreate(BaseModel):
    mrn: str
    full_name: str
    age: Optional[int] = None
    sex: SexEnum
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    admission_time: Optional[datetime] = None
    care_setting: Optional[CareSettingEnum] = None
