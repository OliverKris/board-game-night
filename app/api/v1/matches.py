from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/matches", tags=["Matches"])


@router.post("", response_model=schemas.MatchRequestOut)
def create_match_request(req: schemas.MatchRequestCreate, db: Session = Depends(get_db)):
    db_req = models.MatchRequest(user_id=req.user_id, game_id=req.game_id)
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req


@router.get("", response_model=list[schemas.MatchRequestOut])
def list_match_requests(db: Session = Depends(get_db)):
    return db.query(models.MatchRequest).all()