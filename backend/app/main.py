import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.models import *  # ensure all models are registered
from app.api.deps import get_or_create_demo_user
from app.services.dataset_service import dataset_service

# Import API Routers
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.datasets import router as datasets_router
from app.api.routes.cleaning import router as cleaning_router
from app.api.routes.visualizations import router as vis_router
from app.api.routes.ai import router as ai_router
from app.api.routes.reports import router as reports_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("data_analyzer")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)

    # Seed demo user & initial sample datasets if empty
    db = SessionLocal()
    try:
        demo_user = get_or_create_demo_user(db)
        # Check if sample datasets already exist
        dataset_count = db.query(Dataset).filter(Dataset.user_id == demo_user.id).count()
        if dataset_count == 0:
            logger.info("Seeding initial realistic sample datasets for instant demonstration...")
            dataset_service.create_sample_datasets(db, demo_user)
    except Exception as e:
        logger.warning(f"Error during startup data seeding: {e}")
    finally:
        db.close()

    yield
    logger.info("Data_Analyzer backend shutting down gracefully.")


app = FastAPI(
    title="Data_Analyzer — AI-Powered Data Analytics Platform",
    description="Enterprise-grade data analysis, quality remediation, interactive visualization, and conversational data intelligence.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please verify dataset format and request parameters."}
    )

# Include Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(datasets_router, prefix=settings.API_V1_STR)
app.include_router(cleaning_router, prefix=settings.API_V1_STR)
app.include_router(vis_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "Welcome to Data_Analyzer API.",
        "docs": "/api/docs",
        "health": "/api/health"
    }
