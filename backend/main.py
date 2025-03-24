import os
import base64
from dotenv import load_dotenv

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from langchain_ollama.chat_models import ChatOllama
from google.cloud import firestore
from langchain_google_firestore import FirestoreChatMessageHistory
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.messages import HumanMessage, SystemMessage
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.vectorstores.base import VectorStoreRetriever

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(CURRENT_DIR, "uploads")
DB_DIR = os.path.join(CURRENT_DIR, "db")


os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)
FIRESTORE_CLIENT = firestore.Client(project=os.environ.get("FIRESTORE_PROJECT_ID"))

def get_chat_history(user_id:str)->FirestoreChatMessageHistory:
    chat_history = FirestoreChatMessageHistory(
        session_id=user_id,
        collection=os.environ.get("FIRESTORE_CHAT_HISTORY_COLLECTION"),
        client=FIRESTORE_CLIENT,
    )

    return chat_history

@app.get("/api")
async def root():
    return "Try routes with /api/v1/"

@app.get("/api/v1/chat_history")
async def chat_history(user_id: str):
    return get_chat_history(user_id=user_id).messages

@app.post("/api/v1/chat")
async def chat(
    user_id: str,
    chat_id: str,
    user_message: str = Form(...),
    file: Optional[UploadFile] = File(None)
)->dict:
    ai_message = await handle_chat(user_message, user_id, chat_id, file)
    return {"user_message": user_message, "ai_message":ai_message}

async def handle_chat(message:str, user_id:str, chat_id:str, file:Optional[UploadFile]=File(None))->str:
    
    chat_history = get_chat_history(user_id=user_id)
    chat_history.add_user_message(message)
    
    if file:
        handle_file(user_id, chat_id, file)

    rag_chain = await get_rag_chain(user_id, chat_id, file)
    ai_message = rag_chain.invoke({"input": message, "chat_history": chat_history.messages})['answer']
    chat_history.add_ai_message(ai_message)
    
    return ai_message

def handle_file(user_id: str, chat_id: str, file: Optional[UploadFile] = File(None)):
    os.makedirs(os.path.join(UPLOAD_DIR, user_id, chat_id), exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, user_id, chat_id, file.filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    return file_path

async def get_rag_chain(user_id:str, chat_id:str, file: Optional[UploadFile] = File(None))->create_retrieval_chain:
    model = ChatOllama(model="mistral:latest", temperature=0.25)
    qa_prompt = get_qa_prompt()
    
    if not file:
        return create_stuff_documents_chain(model, qa_prompt)
    
    db = await get_db(user_id, chat_id, file)
    retriever = get_retriever(db, 'similarity', {'k':3})
    chain = create_history_aware_retriever(model, retriever, get_contextualize_q_prompt())

    return chain

async def get_db(user_id:str, chat_id:str, file: Optional[UploadFile] = File(None))->Chroma:   
    persistent_directory = os.path.join(DB_DIR, user_id, chat_id)
    embeddings = OpenAIEmbeddings(
        model=os.getenv("OPENAI_EMBEDDING_MODEL"), 
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    documents = []

    if file:
        loader = TextLoader(file.file.read(), encoding='utf-8')
        docs = loader.load()
        for doc in docs:
            doc.metadata = {"source": file.filename}
            documents.append(doc)

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=300)
        docs = text_splitter.split_documents(documents)

    return Chroma.from_documents(documents, embeddings, persist_directory=persistent_directory)

def get_retriever(db:Chroma, search_type:str, search_kwags:dict)->VectorStoreRetriever:
    return db.as_retriever(
        search_type=search_type,
        search_kwargs=search_kwags,
    )

def get_qa_prompt()->ChatPromptTemplate:
    qa_system_prompt = (
        "You are a geat assistant for question-answering tasks. "
        "You have Masters degree in finding answer of a given question from given context. "
        "Use the following pieces of retrieved context to answer the "
        "question. If you don't know the answer, just say that you don't know. "
        "Use three sentences maximum and keep the answer concise."
        "\n\nContext: \n{context}"
    )

    return ChatPromptTemplate.from_messages(
        [
            ("system", qa_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )


def get_contextualize_q_prompt()->ChatPromptTemplate:
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question which might reference context in the chat history, "
        "formulate a standalone question which can be understood without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )

    return ChatPromptTemplate.from_messages(
        [
            ("system", contextualize_q_system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
        ]
    )
