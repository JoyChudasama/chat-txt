from fastapi import APIRouter, HTTPException, Form
from app.services.chat import get_chat_history
from app.services.rag_service import get_rag_chain
from app.models.chat_response import ChatResponse
from backend.app.services.vector_store_service import get_vector_store
from app.db.firestore import FIRESTORE_CLIENT

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(user_id: str, chat_id: str, user_message: str = Form(...)):
    if not user_message:
        return {"user_message": "", "ai_message": "No message"}
    
    chat_history = get_chat_history(user_id=user_id, chat_id=chat_id)
    chat_history.add_user_message(user_message)

    rag_chain = await get_rag_chain(user_id, chat_id)
    ai_message = rag_chain.invoke({
        "input": user_message,
        "chat_history": chat_history.messages
    })['answer']

    chat_history.add_ai_message(ai_message)
    return {"user_message": user_message, "ai_message": ai_message}

@router.get("/history")
async def chat_history(user_id: str, chat_id: str):
    return get_chat_history(user_id=user_id, chat_id=chat_id).messages

@router.delete("/{chat_id}")
async def delete_chat(chat_id: str, user_id: str):
    try:
        vector_store = get_vector_store(user_id, chat_id)
        if vector_store:
            vector_store.delete(where={"chat_id": chat_id})
        
        chats_collection = FIRESTORE_CLIENT.collection(user_id)
        chats_collection.document(chat_id).delete()
        
        return {"message": "Chat deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 