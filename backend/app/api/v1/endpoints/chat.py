from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.app.services.session_service import get_session_messages, get_session_file_name
from app.services.rag_service import get_rag_chain
from langchain_ollama.chat_models import ChatOllama
import json

router = APIRouter()

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
            has_file = get_session_file_name(user_id, session_id)
            
            if(has_file != ''):
                rag_chain = await get_rag_chain(user_id, session_id)
                ai_message = rag_chain.invoke({
                    "input": user_message,
                    "chat_history": chat_history.messages
                })['answer']
            else:
                model = ChatOllama(model="mistral:latest", temperature=0.5)
                ai_message = model.invoke(chat_history.messages).content
            
            chat_history.add_ai_message(ai_message)
            await websocket.send_json({"user_message": user_message, "ai_message": ai_message})
    except WebSocketDisconnect:
        print(f"Client disconnected: {user_id}")
    except Exception as e:
        print(f"Error in websocket connection: {str(e)}")
        await websocket.close()
