from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Base de datos
    DATABASE_URL: str = "sqlite:///./dependia.db"
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Dependia"
    VERSION: str = "0.1.0"
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

