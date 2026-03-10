from fastapi import APIRouter, Depends
from app.knowledge_bank.registry import get_module, list_modules
from app.knowledge_bank.schemas import ModuleResponse, ModuleListResponse
from app.auth.rbac import require_data_scientist
from app.models.user import User
from app.core.config import settings

router = APIRouter(prefix="/kb", tags=["Knowledge Bank"])


@router.get("/modules", response_model=ModuleListResponse)
def list_kb_modules(
    _: User = Depends(require_data_scientist),
):
    modules = list_modules()
    from app.knowledge_bank.loader import get_cached_kb
    kb = get_cached_kb()
    return ModuleListResponse(
        total=len(modules),
        bank_name=kb.knowledge_bank.name,
        bank_version=kb.knowledge_bank.version,
        modules=modules,
    )


@router.get("/modules/{module_name}", response_model=ModuleResponse)
def get_kb_module(
    module_name: str,
    _: User = Depends(require_data_scientist),
):
    return get_module(module_name)
