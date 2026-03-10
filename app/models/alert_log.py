import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Boolean, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.db.base import Base, TimestampMixin


class AlertSeverityEnum(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"


class AlertStatusEnum(str, enum.Enum):
    open = "open"
    acknowledged = "acknowledged"
    resolved = "resolved"


class AlertLog(Base, TimestampMixin):
    __tablename__ = "alert_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.patient_id"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    alert_type = Column(String(128), nullable=False)
    severity = Column(SAEnum(AlertSeverityEnum), default=AlertSeverityEnum.info, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(SAEnum(AlertStatusEnum), default=AlertStatusEnum.open, nullable=False)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    triggered_at = Column(DateTime(timezone=True), nullable=False)

    patient = relationship("Patient", back_populates="alert_logs")
    user = relationship("User", back_populates="alert_logs")
