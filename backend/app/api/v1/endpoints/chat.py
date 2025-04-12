from fastapi import APIRouter, Form, WebSocket, WebSocketDisconnect
from backend.app.services.session_service import get_session_messages
from app.services.rag_service import get_rag_chain
from app.models.chat_response import ChatResponse
import json

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

@router.websocket("/ws/{user_id}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, session_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            user_message = message_data.get("message", "")
            
            if not user_message:
                await websocket.send_json({"user_message": "", "ai_message": "No message"})
                continue
            
            chat_history = get_session_messages(user_id=user_id, session_id=session_id)
            chat_history.add_user_message(user_message)

            rag_chain = await get_rag_chain(user_id, session_id)
            ai_message = rag_chain.invoke({
                "input": user_message,
                "chat_history": chat_history.messages
            })['answer']

            chat_history.add_ai_message(ai_message)
            await websocket.send_json({"user_message": user_message, "ai_message": ai_message})
            
    except WebSocketDisconnect:
        print(f"Client disconnected: {user_id}")
    except Exception as e:
        print(f"Error in websocket connection: {str(e)}")
        await websocket.close()
