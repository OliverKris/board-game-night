from sqlalchemy import (
    Column,
    UUID,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Table,
    PrimaryKeyConstraint
)
import uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

# Many-to-many: which users own which games
user_games = Table(
    "user_games",
    Base.metadata,
    Column("user_id", UUID, ForeignKey("users.id"), primary_key=True),
    Column("game_id", Integer, ForeignKey("games.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    games = relationship("Game", secondary=user_games, back_populates="owners")


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    min_players = Column(Integer, default=2)
    max_players = Column(Integer, default=4)
    bgg_id = Column(Integer, nullable=True)  # BoardGameGeek ID, if seeded from BGG

    owners = relationship("User", secondary=user_games, back_populates="games")


class MatchRequest(Base):
    __tablename__ = "match_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=False)
    status = Column(String, default="pending")  # pending, matched, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
    game = relationship("Game")


class Friendship(Base):
    __tablename__ = "friendships"
    __table_args__ = (PrimaryKeyConstraint("user_id", "friend_id"),)

    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    friend_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, accepted, blocked
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    friend = relationship("User", foreign_keys=[friend_id])


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    game_id = Column(Integer, ForeignKey("games.id"), nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    capacity = Column(Integer, nullable=True)  # null = unlimited
    visibility = Column(String, default="public")  # public, invite_only
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    created_by = Column(UUID, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    game = relationship("Game")
    creator = relationship("User", foreign_keys=[created_by])


class EventAttendee(Base):
    __tablename__ = "event_attendees"
    __table_args__ = (PrimaryKeyConstraint("event_id", "user_id"),)

    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID, ForeignKey("users.id"), nullable=False)
    rsvp_status = Column(String, default="invited")  # invited, going, declined, waitlisted

    event = relationship("Event")
    user = relationship("User")