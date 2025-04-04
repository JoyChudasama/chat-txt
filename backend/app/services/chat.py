from langchain_google_firestore import FirestoreChatMessageHistory
from app.db.firestore import FIRESTORE_CLIENT

def get_chat_history(user_id: str, chat_id: str) -> FirestoreChatMessageHistory:
    """Get or create a chat history instance for a user and chat."""
    collection_name = f"{user_id}_messages"
    return FirestoreChatMessageHistory(
        session_id=chat_id,
        collection=collection_name,
        client=FIRESTORE_CLIENT,
    )