from langchain_google_firestore import FirestoreChatMessageHistory
from app.db.firestore import FIRESTORE_CLIENT
from datetime import datetime
from typing import Optional

def create_session(user_id: str, session_id: str, title: str, file_name: Optional[str] = None)->dict:
    """Create a new session in the database."""
    
    collection_name = f"{user_id}_sessions"
    FIRESTORE_CLIENT.collection(collection_name).document(session_id).set({
        "title": title,
        "session_id": session_id,
        "created_at": datetime.now(),
        "file_name": file_name
    })

    return {"message": "Session created successfully"}

def delete_session(user_id: str, session_id: str)->dict:
    """Delete a session from the database."""

    session_collection = f"{user_id}_sessions"
    message_collection = f"{user_id}_messages"

    try:
        FIRESTORE_CLIENT.collection(message_collection).document(session_id).delete()
        FIRESTORE_CLIENT.collection(session_collection).document(session_id).delete()
        return {"message": "Session and its messages deleted successfully"}
    except Exception as e:
        return {"message": f"Error deleting session: {e}"}
    
def get_session_history(user_id: str) -> list[dict]:
    """Get all sessions for a user."""

    collection_name = f"{user_id}_sessions"
    return [doc.to_dict() for doc in FIRESTORE_CLIENT.collection(collection_name).get()]

def get_session_messages(user_id: str, session_id: str) -> FirestoreChatMessageHistory:
    """Get all messages for a session."""

    collection_name = f"{user_id}_messages"
    return FirestoreChatMessageHistory(
        session_id=session_id,
        collection=collection_name,
        client=FIRESTORE_CLIENT,
    )

def get_session_file_name(user_id: str, session_id: str) -> str:
    """Get the file name for a session."""

    collection_name = f"{user_id}_sessions"
    return FIRESTORE_CLIENT.collection(collection_name).document(session_id).get().to_dict()['file_name']