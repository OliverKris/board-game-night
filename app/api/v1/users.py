from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/{user_id}/games/{game_id}")
def add_game_to_user(user_id: UUID, game_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not user or not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User or game not found")

    user.games.append(game)
    db.commit()
    return {"message": f"Added {game.name} to {user.name}'s collection"}