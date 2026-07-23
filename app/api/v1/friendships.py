from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app import models, schemas
from app.api.dependencies import get_current_user_id
from app.database import get_db

router = APIRouter(tags=["Friendships"])


@router.post("/friendships", response_model=schemas.FriendshipOut)
def create_friendship(
    req: schemas.FriendshipCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    if current_user.user_id == req.friend_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot friend yourself")

    existing = (
        db.query(models.Friendship)
        .filter(
            models.Friendship.user_id == current_user.user_id,
            models.Friendship.friend_id == req.friend_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Friend request already exists")

    db_friendship = models.Friendship(user_id=current_user.user_id, friend_id=req.friend_id)
    db.add(db_friendship)
    db.commit()
    db.refresh(db_friendship)
    return db_friendship


@router.patch("/friendships/{requester_id}", response_model=schemas.FriendshipOut)
def update_friendship (
    requester_id: UUID, update: schemas.FriendshipUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id),
):
    friendship = (
        db.query(models.Friendship)
        .filter(
            models.Friendship.user_id == requester_id,
            models.Friendship.friend_id == current_user.user_id
        )
        .first()
    )
    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found"
        )

    friendship.status = update.status
    db.commit()
    db.refresh(friendship)
    return friendship


@router.get("/me/friends", response_model=list[schemas.FriendshipOut])
def list_my_friends(
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id)
):
    return (
        db.query(models.Friendship)
        .filter(
            models.Friendships.status == "accepted",
            or_(
                models.Friendship.user_id == current_user.user_id,
                models.Friendship.friend_id == current_user.user_id
            )
        )
        .all()
    )