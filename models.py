from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from uuid import UUID, uuid4
from enum import Enum

class EntityType(str, Enum):
    SUPPLIER = "supplier"
    PROCESS = "process"

class Criticality(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    BLOCKER = "blocker"

class Supplier(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    criticality: int = Field(default=3, ge=1, le=5)  # 1: Low, 5: Critical
    location: Optional[str] = None
    notes: Optional[str] = None

class Process(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    impact_score: int = Field(default=3, ge=1, le=5)  # 1: Minor, 5: Catastrophic
    owner: Optional[str] = None
    notes: Optional[str] = None

class Dependency(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    source_id: UUID = Field(index=True)
    source_type: EntityType
    target_id: UUID = Field(index=True)
    target_type: EntityType
    criticality: Criticality = Field(default=Criticality.MEDIUM)
    notes: Optional[str] = None

class PlanB(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    dependency_id: UUID = Field(foreign_key="dependency.id")
    name: str
    description: Optional[str] = None
    activation_time: str = Field(default="Instant") # e.g. "2 days", "48h"
    is_active: bool = Field(default=False)
