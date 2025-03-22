import os
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from langchain_ollama.chat_models import ChatOllama
from google.cloud import firestore
from langchain_google_firestore import FirestoreChatMessageHistory

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
PROJECT_ID = os.environ.get("FIRESTORE_PROJECT_ID")
CHAT_HISTORY_COLLECTION = os.environ.get("FIRESTORE_CHAT_HISTORY_COLLECTION")

@app.get("/api")
async def root():
    return "Try routes with /api/v1/"

@app.get("/api/v1/chat_history")
async def chat_history(user_id: str):

    client = firestore.Client(project=PROJECT_ID)

    chat_history = FirestoreChatMessageHistory(
        session_id=user_id,
        collection=CHAT_HISTORY_COLLECTION,
        client=client,
    )
    
    return chat_history.messages

@app.post("/api/v1/chat")
async def chat(
    user_id: str,
    user_message: str = Form(...),
    file: Optional[UploadFile] = File(None)
)->dict:
    handle_file(user_id, file)
    ai_message = await handle_chat(user_message, user_id)

    return {"user_message": user_message, "ai_message":ai_message}


async def handle_chat(message:str, user_id:str)->str:

    client = firestore.Client(project=PROJECT_ID)
    chat_history = FirestoreChatMessageHistory(
        session_id=user_id,
        collection=CHAT_HISTORY_COLLECTION,
        client=client,
    )
    chat_history.add_user_message(message)

    model = ChatOllama(model="mistral:latest", temperature=1)

    ai_message = model.invoke(chat_history.messages).content

    chat_history.add_ai_message(ai_message)

    return ai_message


def handle_file(user_id: str, file: Optional[UploadFile] = File(None)):
    file_path = None
    if file:
        os.makedirs(os.path.join(UPLOAD_DIR, user_id), exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, user_id, file.filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())