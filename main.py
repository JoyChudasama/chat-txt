# import os
# from dotenv import load_dotenv

# from fastapi import FastAPI, File, UploadFile, Form
# from fastapi.middleware.cors import CORSMiddleware
# from typing import Optional
# from langchain_ollama.chat_models import ChatOllama
# from google.cloud import firestore
# from langchain_google_firestore import FirestoreChatMessageHistory
# from langchain.text_splitter import RecursiveCharacterTextSplitter
# from langchain_community.document_loaders import TextLoader
# from langchain_chroma import Chroma
# from langchain_openai import OpenAIEmbeddings
# from langchain_core.messages import HumanMessage, SystemMessage
# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain.chains import create_history_aware_retriever, create_retrieval_chain
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain.vectorstores.base import VectorStoreRetriever

# load_dotenv()
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"], 
#     allow_credentials=True,
#     allow_methods=["*"], 
#     allow_headers=["*"], 
# )

# CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# UPLOAD_DIR = os.path.join(CURRENT_DIR, "uploads")
# DB_DIR = os.path.join(CURRENT_DIR, "db")

# os.makedirs(UPLOAD_DIR, exist_ok=True)
# os.makedirs(DB_DIR, exist_ok=True)
# FIRESTORE_CLIENT = firestore.Client(project=os.environ.get("FIRESTORE_PROJECT_ID"))

# @app.get("/api")
# async def root():
#     return "Try routes with /api/v1/"

# @app.get("/api/v1/chat_history")
# async def chat_history(
#     user_id: str,
#     chat_id: str,
# ):
#     return get_chat_history(user_id=user_id, chat_id=chat_id).messages

# @app.post("/api/v1/upload_file")
# async def upload_file(
#     user_id: str,
#     chat_id: str,
#     file: UploadFile = File(...),
# ):
#     try:
#         file_path = handle_file(user_id, chat_id, file)
#         await prepare_db(user_id, chat_id, file_path)
#         return {"file_path": file_path}
#     except Exception as e:
#         return {"error": str(e)}

# @app.post("/api/v1/chat")
# async def chat(
#     user_id: str,
#     chat_id: str,
#     user_message: str = Form(...),
# )->dict:
#     ai_message = await handle_chat(user_message, user_id, chat_id)
#     return {"user_message": user_message, "ai_message":ai_message}

# async def handle_chat(message:str, user_id:str, chat_id:str)->str:
    
#     if not message:
#         return "No message"
#     chat_history = get_chat_history(user_id=user_id, chat_id=chat_id)
#     chat_history.add_user_message(message)

#     rag_chain = await get_rag_chain(user_id, chat_id)
#     ai_message = rag_chain.invoke({"input": message, "chat_history": chat_history.messages})['answer']

#     chat_history.add_ai_message(ai_message)
    
#     return ai_message

# def get_chat_history(user_id:str, chat_id:str)->FirestoreChatMessageHistory:
#     chat_history = FirestoreChatMessageHistory(
#         session_id=chat_id,
#         collection=user_id,
#         client=FIRESTORE_CLIENT,
#     )

#     return chat_history

# def handle_file(user_id: str, chat_id: str, file: UploadFile = File(...)):
#     os.makedirs(os.path.join(UPLOAD_DIR, user_id, chat_id), exist_ok=True)
#     file_path = os.path.join(UPLOAD_DIR, user_id, chat_id, file.filename)
    
#     with open(file_path, "wb") as buffer:
#         buffer.write(file.file.read())

#     return file_path

# async def get_rag_chain(user_id:str, chat_id:str)->create_retrieval_chain:
#     model = ChatOllama(model="mistral:latest", temperature=0.25)
#     qa_prompt = get_qa_prompt()
    
#     db = get_db(user_id, chat_id)
#     retriever = get_retriever(db, 'similarity', {'k':3})
#     history_aware_retriever = create_history_aware_retriever(model, retriever, get_contextualize_q_prompt())
#     question_answer_chain = create_stuff_documents_chain(model, qa_prompt)

#     return create_retrieval_chain(history_aware_retriever, question_answer_chain)

# def get_db(user_id:str, chat_id:str)->Chroma:   
#     persistent_directory = os.path.join(DB_DIR, user_id, chat_id)
#     embeddings = OpenAIEmbeddings(
#         model=os.getenv("OPENAI_EMBEDDING_MODEL"), 
#         api_key=os.getenv("OPENAI_API_KEY")
#     )
#     if not os.path.exists(persistent_directory):
#         return None
#     return Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

# async def prepare_db(user_id:str, chat_id:str, file_path:str):
#     documents = []
#     loader = TextLoader(file_path, encoding='utf-8')
#     docs = loader.load()

#     for doc in docs:
#             doc.metadata = {"source": file_path}
#             documents.append(doc)

#     text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=300)
#     docs = text_splitter.split_documents(documents)

#     persistent_directory = os.path.join(DB_DIR, user_id, chat_id)
#     embeddings = OpenAIEmbeddings(
#         model=os.getenv("OPENAI_EMBEDDING_MODEL"), 
#         api_key=os.getenv("OPENAI_API_KEY")
#     )

#     Chroma.from_documents(docs, embeddings, persist_directory=persistent_directory)

# def get_retriever(db:Chroma, search_type:str, search_kwags:dict)->VectorStoreRetriever:
#     return db.as_retriever(
#         search_type=search_type,
#         search_kwargs=search_kwags,
#     )

# def get_qa_prompt()->ChatPromptTemplate:
#     qa_system_prompt = (
#         "You are a great assistant for question-answering tasks from a given Context."
#         "You have Masters degree in finding answer of a given question from given Context."
#         "Use the following pieces of retrieved context to answer the question."
#         "If you don't know the answer, just say I don't know."
#         "Use three sentences maximum and keep the answer concise."
#         "\n\nContext: \n{context}"
#     )

#     return ChatPromptTemplate.from_messages(
#         [
#             ("system", qa_system_prompt),
#             MessagesPlaceholder("chat_history"),
#             ("human", "{input}"),
#         ]
#     )

# def get_contextualize_q_prompt()->ChatPromptTemplate:
#     contextualize_q_system_prompt = (
#         "Given a chat history and the latest user question which might reference context in the chat history,"
#         "formulate a standalone question which can be understood without the chat history. Do NOT answer the question,"
#         "just reformulate it if needed and otherwise return it as is."
#     )

#     return ChatPromptTemplate.from_messages(
#         [
#             ("system", contextualize_q_system_prompt),
#             MessagesPlaceholder("chat_history"),
#             ("human", "{input}"),
#         ]
#     )