from typing import List
from fastapi import Depends, HTTPException, status
from app.auth.jwt import get_current_user
from app.models.user import User, RoleEnum


class RoleChecker:
    def __init__(self, allowed_roles: List[RoleEnum]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.name not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role.name}' does not have permission for this resource",
            )
        return current_user


require_clinician = RoleChecker([RoleEnum.clinician, RoleEnum.admin])
require_pharmacist = RoleChecker([RoleEnum.pharmacist, RoleEnum.admin])
require_data_scientist = RoleChecker([RoleEnum.data_scientist, RoleEnum.admin])
require_admin = RoleChecker([RoleEnum.admin])
require_any_role = RoleChecker([r for r in RoleEnum])
