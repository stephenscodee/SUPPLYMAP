from pydantic import BaseModel
from typing import List
from app.schemas.process import Process
from app.schemas.supplier import Supplier


class ProcessWithSingleDependency(BaseModel):
    """Proceso que depende de un solo proveedor (punto de fallo crítico)"""
    process: Process
    supplier_name: str
    dependency_type: str


class SupplierWithoutBackup(BaseModel):
    """Proveedor sin plan B"""
    supplier: Supplier
    affected_processes_count: int


class DashboardMetrics(BaseModel):
    """Métricas agregadas para el dashboard"""
    total_suppliers: int
    total_processes: int
    total_dependencies: int
    
    # Métricas críticas
    processes_with_single_dependency: int
    processes_with_single_dependency_list: List[ProcessWithSingleDependency]
    
    suppliers_without_backup: int
    suppliers_without_backup_list: List[SupplierWithoutBackup]
    
    critical_dependencies_count: int
    high_risk_suppliers_count: int
    
    # Impacto agregado
    total_estimated_recovery_time_hours: float
    total_estimated_economic_impact: float

