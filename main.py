from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.logging import configure_logging, get_logger
from app.core.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from app.api.router import api_router
from app.schemas.common import HealthResponse
from app.knowledge_bank.loader import load_knowledge_bank
from app.db.session import SessionLocal
from scripts.seed_demo_data import seed_demo_data

configure_logging()
logger = get_logger("medirx.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("MediRangeX API starting", version=settings.APP_VERSION, env=settings.APP_ENV)

    try:
        kb = load_knowledge_bank(settings.KNOWLEDGE_BANK_PATH)
        logger.info(
            "knowledge_bank_ready",
            bank=kb.knowledge_bank.name,
            modules=len(kb.knowledge_bank.modules),
        )
    except Exception as exc:
        logger.error("knowledge_bank_load_failed", error=str(exc))
        raise RuntimeError(f"Failed to load knowledge bank: {exc}") from exc

    try:
        db = SessionLocal()
        seeded = seed_demo_data(db)
        if seeded:
            logger.info("demo_data_seeded")
        else:
            logger.info("demo_data_already_exists")
        db.close()
    except Exception as exc:
        logger.warning("demo_seed_skipped", error=str(exc))

    yield
    logger.info("MediRangeX API shutting down")


app = FastAPI(
    title="MediRangeX",
    description="AI Healthcare Intelligence Platform — Clinical Decision Support API",
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(ErrorHandlingMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        service=settings.APP_NAME,
    )
