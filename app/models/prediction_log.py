import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin


class PredictionLog(Base, TimestampMixin):
    __tablename__ = "prediction_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    model_type = Column(String(128), nullable=False)
    model_version = Column(String(32), nullable=True)
    input_payload = Column(JSON, nullable=True)
    output_payload = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    latency_ms = Column(Float, nullable=True)
    status = Column(String(32), default="success", nullable=False)
    error_message = Column(Text, nullable=True)
    requested_at = Column(DateTime(timezone=True), nullable=False)

    patient = relationship("Patient", back_populates="prediction_logs")
    user = relationship("User", back_populates="prediction_logs")
