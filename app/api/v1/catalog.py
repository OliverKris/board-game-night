from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(tags=["Catalog"])


@router.get("/categories", response_model=list[schemas.CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.get("/mechanics", response_model=list[schemas.MechanicOut])
def list_mechanics(db: Session = Depends(get_db)):
    return db.query(models.Mechanic).all()