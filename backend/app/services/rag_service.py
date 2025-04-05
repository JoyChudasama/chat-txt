from langchain_ollama.chat_models import ChatOllama
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from backend.app.services.vector_store_service import get_vector_store, get_retriever
from app.prompts.qa_prompts import get_qa_prompt, get_contextualize_q_prompt

async def get_rag_chain(user_id: str, session_id: str)->create_retrieval_chain:
    """Create a RAG chain for question answering."""
    model = ChatOllama(model="mistral:latest", temperature=0.25)
    qa_prompt = get_qa_prompt()
    
    vector_store = get_vector_store(user_id, session_id)
    retriever = get_retriever(vector_store, 'similarity', {'k': 3})
    history_aware_retriever = create_history_aware_retriever(
        model, 
        retriever, 
        get_contextualize_q_prompt()
    )
    question_answer_chain = create_stuff_documents_chain(model, qa_prompt)

    return create_retrieval_chain(history_aware_retriever, question_answer_chain) 