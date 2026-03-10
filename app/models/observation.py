import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin


class Observation(Base, TimestampMixin):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=False, index=True)
    encounter_id = Column(UUID(as_uuid=True), ForeignKey("encounters.id"), nullable=True, index=True)
    loinc_code = Column(String(32), nullable=True, index=True)
    display_name = Column(String(255), nullable=False)
    value_numeric = Column(Float, nullable=True)
    value_string = Column(String(512), nullable=True)
    unit = Column(String(64), nullable=True)
    observed_at = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="observations")
