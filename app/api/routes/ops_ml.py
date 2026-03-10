import traceback
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import ValidationError

from app.auth.rbac import require_data_scientist
from app.models.user import User
from app.schemas.ops_ml import OperationsMLForecast, OperationsMLRequest
from app.services.ops_ml_service import generate_ops_ml_forecast

router = APIRouter(prefix="/forecast", tags=["Operations ML"])


@router.post("/operations-ml", response_model=OperationsMLForecast)
def forecast_operations_ml(
    request: OperationsMLRequest,
    _: User = Depends(require_data_scientist),
):
    trace_id = str(uuid.uuid4())
    try:
        return generate_ops_ml_forecast(request.raw_input, trace_id=trace_id)
    except ValidationError:
        raise
    except Exception:
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"message": "Internal server error", "trace_id": trace_id},
        )
