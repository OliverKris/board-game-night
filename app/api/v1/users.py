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


# ---- Onboarding: location & gathering type ----

@router.patch("/me/location", response_model=schemas.UserOut)
def update_my_location(
    update: schemas.UserLocationUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/me/gathering-type", response_model=schemas.UserOut)
def update_my_gathering_type(
    update: schemas.UserGatheringTypeUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    user = db.query(models.User).filter(models.User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.preferred_gathering_type = update.preferred_gathering_type.value
    db.commit()
    db.refresh(user)
    return user


# ---- Onboarding: wanted games (distinct from owned games) ----

@router.post("/me/wanted-games/{game_id}", response_model=schemas.UserWantedGameOut)
def add_wanted_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    game = db.query(models.Game).filter(models.Game.id == game_id).first()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")

    existing = (
        db.query(models.WantedGame)
        .filter(
            models.WantedGame.user_id == current_user.user_id,
            models.WantedGame.game_id == game_id,
        )
        .first()
    )
    if existing:
        return existing

    entry = models.WantedGame(user_id=current_user.user_id, game_id=game_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.delete("/me/wanted-games/{game_id}", status_code=status.HTTP_200_OK)
def remove_wanted_game(
    game_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    entry = (
        db.query(models.WantedGame)
        .filter(
            models.WantedGame.user_id == current_user.user_id,
            models.WantedGame.game_id == game_id,
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not in wanted list")

    db.delete(entry)
    db.commit()
    return {"message": "Removed from wanted games"}


@router.get("/me/wanted-games", response_model=list[schemas.UserWantedGameOut])
def list_my_wanted_games(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    return (
        db.query(models.WantedGame)
        .filter(models.WantedGame.user_id == current_user.user_id)
        .all()
    )


# ---- Onboarding: preferred categories ----

@router.post("/me/preferred-categories/{category_id}", response_model=schemas.UserPreferredCategoryOut)
def add_preferred_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    existing = (
        db.query(models.UserPreferredCategory)
        .filter(
            models.UserPreferredCategory.user_id == current_user.user_id,
            models.UserPreferredCategory.category_id == category_id,
        )
        .first()
    )
    if existing:
        return existing

    entry = models.UserPreferredCategory(user_id=current_user.user_id, category_id=category_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/me/preferred-categories", response_model=list[schemas.UserPreferredCategoryOut])
def list_my_preferred_categories(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    return (
        db.query(models.UserPreferredCategory)
        .filter(models.UserPreferredCategory.user_id == current_user.user_id)
        .all()
    )


# ---- Onboarding: preferred mechanics ----

@router.post("/me/preferred-mechanics/{mechanic_id}", response_model=schemas.UserPreferredMechanicOut)
def add_preferred_mechanic(
    mechanic_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    mechanic = db.query(models.Mechanic).filter(models.Mechanic.id == mechanic_id).first()
    if not mechanic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mechanic not found")

    existing = (
        db.query(models.UserPreferredMechanic)
        .filter(
            models.UserPreferredMechanic.user_id == current_user.user_id,
            models.UserPreferredMechanic.mechanic_id == mechanic_id,
        )
        .first()
    )
    if existing:
        return existing

    entry = models.UserPreferredMechanic(user_id=current_user.user_id, mechanic_id=mechanic_id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/me/preferred-mechanics", response_model=list[schemas.UserPreferredMechanicOut])
def list_my_preferred_mechanics(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    return (
        db.query(models.UserPreferredMechanic)
        .filter(models.UserPreferredMechanic.user_id == current_user.user_id)
        .all()
    )


# ---- Onboarding: availability ----

@router.post("/me/availability", response_model=schemas.UserAvailabilityOut)
def add_availability(
    slot: schemas.UserAvailabilityCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    entry = models.Availability(user_id=current_user.user_id, **slot.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/me/availability", response_model=list[schemas.UserAvailabilityOut])
def list_my_availability(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    return (
        db.query(models.Availability)
        .filter(models.Availability.user_id == current_user.user_id)
        .all()
    )


@router.delete("/me/availability/{availability_id}", status_code=status.HTTP_200_OK)
def remove_availability(
    availability_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    entry = (
        db.query(models.Availability)
        .filter(
            models.Availability.id == availability_id,
            models.Availability.user_id == current_user.user_id,
        )
        .first()
    )
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Availability slot not found")

    db.delete(entry)
    db.commit()
    return {"message": "Availability slot removed"}


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user