from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("", response_model=schemas.EventOut)
def create_event(event: schemas.EventCreate, db: Session = Depends(get_db)):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    # Creator is automatically an attendee, marked "going"
    db_attendee = models.EventAttendee(
        event_id=db_event.id, user_id=event.created_by, rsvp_status="going"
    )
    db.add(db_attendee)
    db.commit()

    return db_event


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.post("/{event_id}/attendees", response_model=schemas.EventAttendeeOut)
def rsvp_to_event(
    event_id: int, attendee: schemas.EventAttendeeCreate, db: Session = Depends(get_db)
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    existing = (
        db.query(models.EventAttendee)
        .filter(
            models.EventAttendee.event_id == event_id,
            models.EventAttendee.user_id == attendee.user_id
        )
        .first()
    )

    if existing:
        existing.rsvp_status = attendee.rsvp_status
        db.commit()
        db.refresh(existing)
        return existing

    db_attendee = models.EventAttendee(
        event_id=event_id, user_id=attendee.user_id, rsvp_status=attendee.rsvp_status
    )
    db.add(db_attendee)
    db.commit()
    db.refresh(db_attendee)
    return db_attendee


@router.get("/{event_id}/attendees", response_model=list[schemas.EventAttendeeOut])
def list_event_attendees(event_id: int, db: Session = Depends(get_db)):
    return db.query(models.EventAttendee).filter(models.EventAttendee.event_id == event_id).all()