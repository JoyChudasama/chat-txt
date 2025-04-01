from pydantic import BaseModel

class ChatResponse(BaseModel):
    user_message: str
    ai_message: str