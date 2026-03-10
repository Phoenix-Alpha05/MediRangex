import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class EncounterStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Encounter(Base, TimestampMixin):
    __tablename__ = "encounters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False, index=True)
    encounter_type = Column(String(64), nullable=False)
    status = Column(SAEnum(EncounterStatusEnum), default=EncounterStatusEnum.active, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    chief_complaint = Column(Text, nullable=True)
    discharge_summary = Column(Text, nullable=True)
    attending_clinician_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    patient = relationship("Patient", back_populates="encounters")
