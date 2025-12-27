from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal


class BackupPlanBase(BaseModel):
    supplier_id: int
    alternative_supplier_name: str
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    activation_time_hours: Optional[Decimal] = None
    is_active: bool = False
    notes: Optional[str] = None
    activation_checklist: Optional[str] = None


class BackupPlanCreate(BackupPlanBase):
    pass


class BackupPlanUpdate(BaseModel):
    supplier_id: Optional[int] = None
    alternative_supplier_name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    activation_time_hours: Optional[Decimal] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None
    activation_checklist: Optional[str] = None


class BackupPlan(BackupPlanBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

