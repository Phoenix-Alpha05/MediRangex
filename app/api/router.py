from fastapi import APIRouter
from app.api.routes import auth, patients, predict, check, forecast, ops_ml, reason, standardize, kb, ml_logs, dashboard

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(patients.router)
api_router.include_router(predict.router)
api_router.include_router(check.router)
api_router.include_router(forecast.router)
api_router.include_router(ops_ml.router)
api_router.include_router(reason.router)
api_router.include_router(standardize.router)
api_router.include_router(kb.router)
api_router.include_router(ml_logs.router)
api_router.include_router(dashboard.router, prefix="/dashboard")
