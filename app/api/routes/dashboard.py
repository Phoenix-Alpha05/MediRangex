from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.rbac import RoleChecker
from app.db.session import get_db
from app.models.user import RoleEnum, User
from app.schemas.dashboard import CommandDashboardResponse
from app.services.dashboard_service import generate_command_dashboard

router = APIRouter(tags=["Command Center"])

_require_dashboard_access = RoleChecker(
    [RoleEnum.admin, RoleEnum.clinician, RoleEnum.data_scientist]
)


@router.get("/command-center", response_model=CommandDashboardResponse)
def get_command_dashboard(
    _: User = Depends(_require_dashboard_access),
    db: Session = Depends(get_db),
):
    return generate_command_dashboard(db)
