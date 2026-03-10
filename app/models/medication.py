import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class MedicationStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"
    discontinued = "discontinued"
    on_hold = "on_hold"


class Medication(Base, TimestampMixin):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False, index=True)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.id"), nullable=True, index=True)
    rxnorm_code = Column(String(32), nullable=True, index=True)
    drug_name = Column(String(255), nullable=False)
    dose = Column(String(64), nullable=True)
    route = Column(String(64), nullable=True)
    frequency = Column(String(64), nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(SAEnum(MedicationStatusEnum), default=MedicationStatusEnum.active, nullable=False)
    prescriber_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="medications")
