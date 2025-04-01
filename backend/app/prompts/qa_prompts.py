from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

def get_qa_prompt() -> ChatPromptTemplate:
    """Get the question-answering prompt template."""
    qa_system_prompt = (
        "You are an expert AI assistant with a strong ability to find answers from the given context."
        "Use the retrieved context below to answer the user's question."
        "If the answer is not in the context, respond with 'I don't know.'"
        "Keep your response concise, using at most three sentences."
        "\n\nContext:\n{context}"
    )

    return ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])

def get_contextualize_q_prompt() -> ChatPromptTemplate:
    """Get the contextualized question prompt template."""
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question that may reference prior context, "
        "rephrase the question so that it stands alone without requiring the chat history. "
        "Do NOT answer the question—only reformulate it if necessary. Otherwise, return it as is."
    )

    return ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
