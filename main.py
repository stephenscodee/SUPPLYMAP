from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api import suppliers, processes, dependencies, backup_plans, dashboard

# Crear tablas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Visibilidad de riesgo operativo. Control real sobre dependencias de proveedores."
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(suppliers.router, prefix=settings.API_V1_STR)
app.include_router(processes.router, prefix=settings.API_V1_STR)
app.include_router(dependencies.router, prefix=settings.API_V1_STR)
app.include_router(backup_plans.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Endpoint raíz"""
    return {
        "message": "Dependia API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}

