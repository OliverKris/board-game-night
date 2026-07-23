from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/games", tags=["Games"])


@router.post("/games", response_model=schemas.GameOut)
def create_game(game: schemas.GameCreate, db: Session = Depends(get_db)):
    db_game = models.Game(**game.dict())
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


@router.get("/games", response_model=list[schemas.GameOut])
def list_games(db: Session = Depends(get_db)):
    return db.query(models.Game).all()