from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.api.dependencies import get_current_user_id

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=schemas.EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate, 
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id)
):
    # Force the creator to be the authenticated user
    db_event = models.Event(**event.model_dump(), created_by=current_user.user_id)
    db.add(db_event)
    db.flush()  # Flushes db_event to generate its ID without committing the transaction yet

    # Creator is automatically an attendee, marked "going"
    db_attendee = models.EventAttendee(
        event_id=db_event.id, 
        user_id=current_user.user_id, 
        rsvp_status="going"
    )
    db.add(db_attendee)
    
    # Single atomic commit for both event and host attendance
    db.commit()
    db.refresh(db_event)

    return db_event


@router.get("", response_model=list[schemas.EventOut])
def list_events(db: Session = Depends(get_db)):
    """Public feed of all upcoming game night events."""
    return db.query(models.Event).all()


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )
    return event


@router.post("/{event_id}/rsvp", response_model=schemas.EventAttendeeOut)
def rsvp_to_event(
    event_id: int, 
    rsvp: schemas.EventAttendeeCreate,
    db: Session = Depends(get_db),
    current_user: schemas.TokenData = Depends(get_current_user_id)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Event not found"
        )

    existing = (
        db.query(models.EventAttendee)
        .filter(
            models.EventAttendee.event_id == event_id,
            models.EventAttendee.user_id == current_user.user_id
        )
        .first()
    )

    if existing:
        existing.rsvp_status = rsvp.rsvp_status
        db.commit()
        db.refresh(existing)
        return existing

    db_attendee = models.EventAttendee(
        event_id=event_id, 
        user_id=current_user.user_id, 
        rsvp_status=rsvp.rsvp_status
    )
    db.add(db_attendee)
    db.commit()
    db.refresh(db_attendee)
    return db_attendee


@router.get("/{event_id}/attendees", response_model=list[schemas.EventAttendeeOut])
def list_event_attendees(event_id: int, db: Session = Depends(get_db)):
    return (
        db.query(models.EventAttendee)
        .filter(models.EventAttendee.event_id == event_id)
        .all()
    )