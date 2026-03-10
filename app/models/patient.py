import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class SexEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    unknown = "unknown"


class CareSettingEnum(str, enum.Enum):
    ICU = "ICU"
    Ward = "Ward"
    ED = "ED"


class Patient(Base, TimestampMixin):
    __tablename__ = "patients"

    patient_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mrn = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime(timezone=True), nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(SAEnum(SexEnum), nullable=False)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    admission_time = Column(DateTime(timezone=True), nullable=True)
    care_setting = Column(SAEnum(CareSettingEnum), nullable=True)

    encounters = relationship("Encounter", back_populates="patient")
    observations = relationship("Observation", back_populates="patient")
    medications = relationship("Medication", back_populates="patient")
    prediction_logs = relationship("PredictionLog", back_populates="patient")
    alert_logs = relationship("AlertLog", back_populates="patient")
