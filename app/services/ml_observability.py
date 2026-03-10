import json
import logging
from typing import Any

from app.db.session import SessionLocal
from app.models.ml_prediction_log import MlPredictionLog
from app.schemas.ops_ml import OperationsMLFeatures

logger = logging.getLogger(__name__)


def detect_feature_drift(features: OperationsMLFeatures) -> bool:
    return False


def log_ml_prediction(
    domain: str,
    model_name: str,
    model_version: str,
    model_type: str,
    input_features: Any,
    output_predictions: Any,
    confidence_level: str,
    trace_id: str,
) -> None:
    try:
        if hasattr(input_features, "model_dump"):
            input_dict = input_features.model_dump(mode="json")
        elif isinstance(input_features, dict):
            input_dict = input_features
        else:
            input_dict = vars(input_features)

        if hasattr(output_predictions, "model_dump"):
            output_dict = output_predictions.model_dump(mode="json")
        elif isinstance(output_predictions, dict):
            output_dict = output_predictions
        else:
            output_dict = vars(output_predictions)

        db = SessionLocal()
        try:
            record = MlPredictionLog(
                model_domain=domain,
                model_name=model_name,
                model_version=model_version,
                model_type=model_type,
                input_features_json=json.dumps(input_dict, default=str),
                output_predictions_json=json.dumps(output_dict, default=str),
                confidence_level=confidence_level,
                trace_id=trace_id,
            )
            db.add(record)
            db.commit()
        finally:
            db.close()
    except Exception:
        logger.exception("ml_observability: failed to log prediction (trace_id=%s)", trace_id)
