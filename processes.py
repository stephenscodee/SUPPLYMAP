from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.process import Process
from app.schemas.process import Process as ProcessSchema, ProcessCreate, ProcessUpdate

router = APIRouter(prefix="/processes", tags=["processes"])


@router.get("/", response_model=List[ProcessSchema])
def get_processes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de procesos"""
    processes = db.query(Process).offset(skip).limit(limit).all()
    return processes


@router.get("/{process_id}", response_model=ProcessSchema)
def get_process(process_id: int, db: Session = Depends(get_db)):
    """Obtener un proceso por ID"""
    process = db.query(Process).filter(Process.id == process_id).first()
    if not process:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    return process


@router.post("/", response_model=ProcessSchema, status_code=201)
def create_process(process: ProcessCreate, db: Session = Depends(get_db)):
    """Crear un nuevo proceso"""
    db_process = Process(**process.model_dump())
    db.add(db_process)
    db.commit()
    db.refresh(db_process)
    return db_process


@router.put("/{process_id}", response_model=ProcessSchema)
def update_process(
    process_id: int,
    process_update: ProcessUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un proceso"""
    db_process = db.query(Process).filter(Process.id == process_id).first()
    if not db_process:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    update_data = process_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_process, field, value)
    
    db.commit()
    db.refresh(db_process)
    return db_process


@router.delete("/{process_id}", status_code=204)
def delete_process(process_id: int, db: Session = Depends(get_db)):
    """Eliminar un proceso"""
    db_process = db.query(Process).filter(Process.id == process_id).first()
    if not db_process:
        raise HTTPException(status_code=404, detail="Proceso no encontrado")
    
    db.delete(db_process)
    db.commit()
    return None

