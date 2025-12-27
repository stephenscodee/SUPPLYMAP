from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.dependency import DependencyType


class DependencyBase(BaseModel):
    supplier_id: int
    process_id: int
    dependency_type: DependencyType = DependencyType.MEDIUM
    description: Optional[str] = None
    notes: Optional[str] = None


class DependencyCreate(DependencyBase):
    pass


class DependencyUpdate(BaseModel):
    supplier_id: Optional[int] = None
    process_id: Optional[int] = None
    dependency_type: Optional[DependencyType] = None
    description: Optional[str] = None
    notes: Optional[str] = None


class Dependency(DependencyBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

