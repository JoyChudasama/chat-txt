import os
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from langchain_ollama.chat_models import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

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

@app.get("/api")
async def root():
    return "Try routes with /api/v1/"

@app.post("/api/v1/chat")
async def chat(
    user_message: str = Form(...),
    file: Optional[UploadFile] = File(None)
)->dict:
    handle_file(file)
    ai_message = await handle_chat(user_message)
    
    return {"user_message": user_message, "ai_message":ai_message}


async def handle_chat(message:str)->str:
    model = ChatOllama(model="mistral:latest", temperature=1)
    return model.invoke([HumanMessage(content=message)]).content
def handle_file(file):
    file_path = None
    if file:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file.file.read())