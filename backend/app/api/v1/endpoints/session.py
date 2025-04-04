from fastapi import APIRouter
from app.services.session import get_session_history

router = APIRouter()

@router.get("/history")
async def session_history(user_id: str):
    return get_session_history(user_id)