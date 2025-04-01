# ChatPDF Backend

A FastAPI-based backend service that enables chat interactions with PDF documents using RAG (Retrieval Augmented Generation) and Ollama.

## Features

- PDF document processing and storage
- Chat history management with Firestore
- RAG-based question answering using Ollama
- Vector storage using Chroma
- RESTful API endpoints for chat and file operations

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── chat.py
│   │       │   └── file_upload.py
│   │       └── routes.py
│   ├── core/
│   │   ├── app_setup.py
│   │   ├── config.py
│   │   └── __init__.py
│   ├── db/
│   │   ├── firestore.py
│   │   └── __init__.py
│   ├── models/
│   │   ├── chat_messge.py
│   │   ├── chat_response.py
│   │   ├── file_upload_response.py
│   │   └── __init__.py
│   ├── prompts/
│   │   ├── qa_prompts.py
│   │   └── __init__.py
│   ├── services/
│   │   ├── chat_service.py
│   │   ├── file_service.py
│   │   ├── rag_service.py
│   │   ├── vector_store_service.py
│   │   └── __init__.py    
│   ├── main.py
│   └── __init__.py
├── .env
├── .env.example
└── requirements.txt
```

## Prerequisites

- Python 3.8+
- Ollama installed and running locally
- Google Cloud Project with Firestore enabled
- OpenAI API key for Embeddings

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
FIRESTORE_PROJECT_ID=your_project_id
ALLOWED_ORIGINS=[your_frontend_server]
```

## Installation

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up Google Cloud credentials:

## Running the Application

1. Start Ollama locally:
```bash
ollama serve
```

2. Run the FastAPI application:
```bash
fastapi dev /backend/app/main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Chat Endpoints

- `POST /api/v1/chat`
  - Upload a message and get AI response
  - Parameters:
    - `user_id`: User identifier
    - `chat_id`: Chat session identifier
    - `user_message`: Message content

- `GET /api/v1/chat_history`
  - Retrieve chat history for a session
  - Parameters:
    - `user_id`: User identifier
    - `chat_id`: Chat session identifier

### File Upload Endpoints

- `POST /api/v1/upload_file`
  - Upload a PDF file for processing
  - Parameters:
    - `user_id`: User identifier
    - `chat_id`: Chat session identifier
    - `file`: PDF file