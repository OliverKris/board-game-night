from datetime import datetime, time
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr

class GatheringType(str, Enum):
    SMALL_GROUP = "small_group"
    STORE_EVENT = "store_event"
    SMALL_EVENT = "large_event"

class RecurrenceType(str, Enum):
    ONE_TIME = "one_time"
    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"

class OwnerType(str, Enum):
    USER = "user"
    BUSINESS = "business"

class GroupStatus(str, Enum):
    RECRUITING = "recruiting"
    FULL = "full"
    INACTIVE = "inactive"

# ======================================== 
# 1. User & User Preferences
# ========================================


class UserAvailabilityCreate(BaseModel):
    day_of_week: int  # 0 = Monday, 6 = Sunday
    start_time: time
    end_time: time


class UserAvailabilityOut(UserAvailabilityCreate):
    id: int
    user_id: UUID

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr

# Requirement #1: Games Wanted
class UserWantedGameCreate(BaseModel):
    game_id: int

class UserWantedGameOut(BaseModel):
    user_id: UUID
    game_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Requirement #2: Category Preferences
class UserPreferredCategoryCreate(BaseModel):
    category_id: int

class UserPreferredCategoryOut(BaseModel):
    user_id: UUID
    category_id: int

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    preferred_gathering_type: Optional[GatheringType]

class UserOut(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True


class GameCreate(BaseModel):
    name: str
    min_players: int = 2
    max_players: int = 4
    bgg_id: Optional[int] = None


class GameOut(BaseModel):
    id: int
    name: str
    min_players: int
    max_players: int
    bgg_id: Optional[int]

    class Config:
        from_attributes = True


class MatchRequestCreate(BaseModel):
    user_id: UUID
    game_id: int


class MatchRequestOut(BaseModel):
    id: int
    user_id: UUID
    game_id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class FriendshipCreate(BaseModel):
    user_id: UUID
    friend_id: UUID


class FriendshipUpdate(BaseModel):
    status: str  # "accepted" or "blocked"


class FriendshipOut(BaseModel):
    user_id: UUID
    friend_id: UUID
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    game_id: Optional[int] = None
    scheduled_at: datetime
    capacity: Optional[int] = None
    visibility: str = "public"
    created_by: UUID


class EventOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    game_id: Optional[int]
    scheduled_at: datetime
    capacity: Optional[int]
    visibility: str
    status: str
    created_by: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class EventAttendeeCreate(BaseModel):
    user_id: int
    rsvp_status: str = "going"


class EventAttendeeOut(BaseModel):
    event_id: int
    user_id: int
    rsvp_status: str

    class Config:
        from_attributes = True


class TokenData(BaseModel):
    user_id: Optional[UUID] = None