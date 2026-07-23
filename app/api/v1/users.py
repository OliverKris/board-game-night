from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.api.dependencies import get_current_user_id

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id)
):
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/me/games/{game_id}")
def add_game_to_my_collection(
    game_id: int, 
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id)
):
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    game = db.query(models.Game).filter(models.Game.id == game_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User profile not found"
        )
    if not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Game not found in catalog"
        )

    # Check for duplicates before appending
    if game in user.games:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Game is already in your collection"
        )

    user.games.append(game)
    db.commit()
    return {"message": f"Added {game.name} to {user.name}'s collection"}


@router.delete("/me/games/{game_id}", status_code=status.HTTP_200_OK)
def remove_game_from_my_collection(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    """Remove a game from the logged-in user's collection."""
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    game = db.query(models.Game).filter(models.Game.id == game_id).first()

    if not user or not game:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User or game not found"
        )

    if game not in user.games:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Game is not in your collection"
        )

    user.games.remove(game)
    db.commit()
    return {"message": f"Removed '{game.name}' from your collection"}


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user