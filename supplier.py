from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.models.supplier import RiskLevel


class SupplierBase(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    risk_level: RiskLevel = RiskLevel.MEDIUM


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[RiskLevel] = None


class Supplier(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

