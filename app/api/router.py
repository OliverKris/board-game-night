from fastapi import APIRouter

from app.api.v1 import events, friendships, games, matches, users

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(users.router)
api_router.include_router(games.router)
api_router.include_router(friendships.router)
api_router.include_router(events.router)
api_router.include_router(matches.router)