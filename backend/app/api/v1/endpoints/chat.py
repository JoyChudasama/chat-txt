from fastapi import APIRouter, Form
from backend.app.services.session_service import get_session_messages
from app.services.rag_service import get_rag_chain
from app.models.chat_response import ChatResponse

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(user_id: str, session_id: str, user_message: str = Form(...)):
    if not user_message:
        return {"user_message": "", "ai_message": "No message"}
    
    chat_history = get_session_messages(user_id=user_id, session_id=session_id)
    chat_history.add_user_message(user_message)

    rag_chain = await get_rag_chain(user_id, session_id)
    ai_message = rag_chain.invoke({
        "input": user_message,
        "chat_history": chat_history.messages
    })['answer']

    chat_history.add_ai_message(ai_message)
    return {"user_message": user_message, "ai_message": ai_message}
