from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from datetime import datetime

from app.auth.rbac import require_admin
from app.db.session import get_db
from app.models.ml_prediction_log import MlPredictionLog
from app.models.user import User
from sqlalchemy.orm import Session

router = APIRouter(prefix="/ml", tags=["ML Observability"])


class MlPredictionLogResponse(BaseModel):
    id: str
    model_domain: str
    model_name: str
    model_version: str
    model_type: str
    confidence_level: Optional[str]
    trace_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/logs", response_model=List[MlPredictionLogResponse])
def list_ml_prediction_logs(
    domain: Optional[str] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(MlPredictionLog).order_by(MlPredictionLog.created_at.desc())
    if domain:
        query = query.filter(MlPredictionLog.model_domain == domain)
    records = query.offset(offset).limit(limit).all()
    return [
        MlPredictionLogResponse(
            id=str(r.id),
            model_domain=r.model_domain,
            model_name=r.model_name,
            model_version=r.model_version,
            model_type=r.model_type,
            confidence_level=r.confidence_level,
            trace_id=r.trace_id,
            created_at=r.created_at,
        )
        for r in records
    ]
