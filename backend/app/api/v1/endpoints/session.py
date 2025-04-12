from fastapi import APIRouter, HTTPException
from backend.app.services.session_service import get_session_history, delete_session, get_session_messages

router = APIRouter()

@router.get("/history")
async def history(user_id: str):
    return get_session_history(user_id)

@router.get("/messages")
async def messages(session_id: str, user_id: str):
    return get_session_messages(user_id=user_id, session_id=session_id).messages

@router.delete("/{session_id}")
async def delete(session_id: str, user_id: str):
    try:
        delete_session(user_id, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 