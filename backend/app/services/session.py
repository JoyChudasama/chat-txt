from langchain_google_firestore import FirestoreChatMessageHistory
from app.db.firestore import FIRESTORE_CLIENT
from datetime import datetime

def get_session_history(user_id: str) -> FirestoreChatMessageHistory:
    """Get or create a chat history instance for a user and chat."""
    collection_name = f"{user_id}_sessions"
    return [doc.to_dict() for doc in FIRESTORE_CLIENT.collection(collection_name).get()]

def create_session(user_id: str, session_id: str)->str:
    collection_name = f"{user_id}_sessions"
    FIRESTORE_CLIENT.collection(collection_name).document(session_id).set({
        "title": "New Session",
        "session_id": session_id,
        "created_at": datetime.now(),
    })
    return collection_name
