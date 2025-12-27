from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProcessBase(BaseModel):
    name: str
    description: Optional[str] = None
    department: Optional[str] = None
    estimated_recovery_time_hours: Optional[Decimal] = None
    estimated_economic_impact: Optional[Decimal] = None


class ProcessCreate(ProcessBase):
    pass


class ProcessUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    estimated_recovery_time_hours: Optional[Decimal] = None
    estimated_economic_impact: Optional[Decimal] = None


class Process(ProcessBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

