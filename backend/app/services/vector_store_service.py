import os
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.base import VectorStoreRetriever
from app.core.config import VECTOR_STORE_DIR, OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL

async def prepare_vector_store(user_id: str, session_id: str, file_path: str)->Chroma:
    """Prepare the vector database with document embeddings."""
    
    documents = []
    loader = TextLoader(file_path, encoding='utf-8')
    docs = loader.load()

    for doc in docs:
        doc.metadata = {"source": file_path}
        documents.append(doc)

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=300)
    docs = text_splitter.split_documents(documents)

    persistent_directory = os.path.join(VECTOR_STORE_DIR, user_id, session_id)
    embeddings = OpenAIEmbeddings(
        model=OPENAI_EMBEDDING_MODEL,
        api_key=OPENAI_API_KEY
    )

    return Chroma.from_documents(docs, embeddings, persist_directory=persistent_directory)

def get_vector_store(user_id:str, session_id:str)->Chroma|None:   
    """Get the vector store for a given user and chat."""
    persistent_directory = os.path.join(VECTOR_STORE_DIR, user_id, session_id)
    embeddings = OpenAIEmbeddings(
        model=os.getenv("OPENAI_EMBEDDING_MODEL"), 
        api_key=os.getenv("OPENAI_API_KEY")
    )
    
    if not os.path.exists(persistent_directory):
        return None
    
    return Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

def get_retriever(vector_store:Chroma, search_type:str, search_kwags:dict)->VectorStoreRetriever:
    """Get the retriever for a given vector store."""
    return vector_store.as_retriever(
        search_type=search_type,
        search_kwargs=search_kwags,
    )