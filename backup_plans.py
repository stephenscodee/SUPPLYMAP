from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.backup_plan import BackupPlan
from app.schemas.backup_plan import BackupPlan as BackupPlanSchema, BackupPlanCreate, BackupPlanUpdate

router = APIRouter(prefix="/backup-plans", tags=["backup-plans"])


@router.get("/", response_model=List[BackupPlanSchema])
def get_backup_plans(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de planes B"""
    backup_plans = db.query(BackupPlan).offset(skip).limit(limit).all()
    return backup_plans


@router.get("/{backup_plan_id}", response_model=BackupPlanSchema)
def get_backup_plan(backup_plan_id: int, db: Session = Depends(get_db)):
    """Obtener un plan B por ID"""
    backup_plan = db.query(BackupPlan).filter(BackupPlan.id == backup_plan_id).first()
    if not backup_plan:
        raise HTTPException(status_code=404, detail="Plan B no encontrado")
    return backup_plan


@router.post("/", response_model=BackupPlanSchema, status_code=201)
def create_backup_plan(backup_plan: BackupPlanCreate, db: Session = Depends(get_db)):
    """Crear un nuevo plan B"""
    db_backup_plan = BackupPlan(**backup_plan.model_dump())
    db.add(db_backup_plan)
    db.commit()
    db.refresh(db_backup_plan)
    return db_backup_plan


@router.put("/{backup_plan_id}", response_model=BackupPlanSchema)
def update_backup_plan(
    backup_plan_id: int,
    backup_plan_update: BackupPlanUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un plan B"""
    db_backup_plan = db.query(BackupPlan).filter(BackupPlan.id == backup_plan_id).first()
    if not db_backup_plan:
        raise HTTPException(status_code=404, detail="Plan B no encontrado")
    
    update_data = backup_plan_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_backup_plan, field, value)
    
    db.commit()
    db.refresh(db_backup_plan)
    return db_backup_plan


@router.delete("/{backup_plan_id}", status_code=204)
def delete_backup_plan(backup_plan_id: int, db: Session = Depends(get_db)):
    """Eliminar un plan B"""
    db_backup_plan = db.query(BackupPlan).filter(BackupPlan.id == backup_plan_id).first()
    if not db_backup_plan:
        raise HTTPException(status_code=404, detail="Plan B no encontrado")
    
    db.delete(db_backup_plan)
    db.commit()
    return None

