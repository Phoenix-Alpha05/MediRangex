import uuid
from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base, TimestampMixin


class MlPredictionLog(Base, TimestampMixin):
    __tablename__ = "ml_prediction_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_domain = Column(String(64), nullable=False, index=True)
    model_name = Column(String(128), nullable=False)
    model_version = Column(String(64), nullable=False)
    model_type = Column(String(32), nullable=False)
    input_features_json = Column(Text, nullable=True)
    output_predictions_json = Column(Text, nullable=True)
    confidence_level = Column(String(16), nullable=True)
    trace_id = Column(String(64), nullable=True, index=True)
