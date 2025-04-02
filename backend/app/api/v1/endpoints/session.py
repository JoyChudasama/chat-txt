from fastapi import APIRouter

router = APIRouter()

@router.get("/past")
async def chat_history(user_id: str):
    return [{
        "chat_id": "chat_1",
        "title": "Session 1"
    }, {
        "chat_id": "chat_2",
        "title": "Session 2"
    }]