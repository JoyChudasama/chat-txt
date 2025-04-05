# ChatPDF Backend

The backend part of Chat PDF, built with FastAPI, Python, and Langchain.

## Features

- 🚀 FastAPI for high-performance API
- 📄 PDF processing with Langchain
- 💬 Chat history management with Firestore
- 🤖 Local LLM integration with Ollama
- 📚 Session management
- 🔍 Context-aware responses

## Tech Stack

- Python 3.9+
- FastAPI
- Langchain
- Firebase/Firestore
- Ollama (Local LLM)
- PyPDF2
- Pydantic

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── chat.py
│   │       │   └── file_upload.py
│   │       │   └── session.py
│   │       └── routes.py
│   ├── core/
│   │   ├── app_setup.py
│   │   └── config.py
│   ├── db/
│   │   └── firestore.py
│   ├── models/
│   │   ├── chat_message.py
│   │   ├── chat_response.py
│   │   └── file_upload_response.py
│   ├── prompts/
│   │   └── qa_prompts.py
│   ├── services/
│   │   ├── file_serivce.py
│   │   ├── rag_serivce.py
│   │   ├── session_service.py
│   │   └── vector_store_service.py
│   └── main.py
├── requirements.txt
├── README.md
└── .env.example
```

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file using `.env.example`

5. Start the server:
```bash
fastapi dev /backend/app/main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Session Management
- `GET /api/v1/session/past?user_id={user_id}`
  - Get all past sessions for a user
  - Returns: List of sessions with titles and IDs

- `POST /api/v1/session`
  - Create a new session
  - Body: `{ "user_id": string, "title": string }`
  - Returns: Session ID and confirmation

- `DELETE /api/v1/session/{session_id}?user_id={user_id}`
  - Delete a session and its messages
  - Returns: Success message

### File Operations
- `POST /api/v1/upload_file`
  - Upload and process a PDF file
  - Form Data: `file` (PDF), `session_id` (string)
  - Returns: Success message

### Chat Operations
- `POST /api/v1/chat`
  - Send a message and get AI response
  - Body: `{ "user_id": string, "session_id": string, "message": string }`
  - Returns: AI response

## Database Structure

### Firestore Collections
- `{user_id}_sessions`
  - Document: `{session_id}`
    - Fields: title, created_at, session_id

- `{user_id}_messages`
  - Document: `{session_id}`
    - Subcollection: messages
      - Document: `{message_id}`
        - Fields: content, type, timestamp

## Services

### Chat Service
- Handles message processing
- Manages chat history
- Integrates with Ollama for responses

### Session Service
- Manages user sessions
- Handles session creation/deletion
- Maintains session metadata

### Upload Service
- Processes PDF files
- Creates document embeddings
- Manages file storage