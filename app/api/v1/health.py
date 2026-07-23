from fastapi import APIRouter, Depends, status

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("")
def health_check():
    return {"status": "ok", "type": "api_v1_health"}