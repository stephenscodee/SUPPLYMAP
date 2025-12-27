from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.dependency import Dependency
from app.schemas.dependency import Dependency as DependencySchema, DependencyCreate, DependencyUpdate

router = APIRouter(prefix="/dependencies", tags=["dependencies"])


@router.get("/", response_model=List[DependencySchema])
def get_dependencies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener lista de dependencias"""
    dependencies = db.query(Dependency).offset(skip).limit(limit).all()
    return dependencies


@router.get("/{dependency_id}", response_model=DependencySchema)
def get_dependency(dependency_id: int, db: Session = Depends(get_db)):
    """Obtener una dependencia por ID"""
    dependency = db.query(Dependency).filter(Dependency.id == dependency_id).first()
    if not dependency:
        raise HTTPException(status_code=404, detail="Dependencia no encontrada")
    return dependency


@router.post("/", response_model=DependencySchema, status_code=201)
def create_dependency(dependency: DependencyCreate, db: Session = Depends(get_db)):
    """Crear una nueva dependencia"""
    db_dependency = Dependency(**dependency.model_dump())
    db.add(db_dependency)
    db.commit()
    db.refresh(db_dependency)
    return db_dependency


@router.put("/{dependency_id}", response_model=DependencySchema)
def update_dependency(
    dependency_id: int,
    dependency_update: DependencyUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar una dependencia"""
    db_dependency = db.query(Dependency).filter(Dependency.id == dependency_id).first()
    if not db_dependency:
        raise HTTPException(status_code=404, detail="Dependencia no encontrada")
    
    update_data = dependency_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_dependency, field, value)
    
    db.commit()
    db.refresh(db_dependency)
    return db_dependency


@router.delete("/{dependency_id}", status_code=204)
def delete_dependency(dependency_id: int, db: Session = Depends(get_db)):
    """Eliminar una dependencia"""
    db_dependency = db.query(Dependency).filter(Dependency.id == dependency_id).first()
    if not db_dependency:
        raise HTTPException(status_code=404, detail="Dependencia no encontrada")
    
    db.delete(db_dependency)
    db.commit()
    return None

