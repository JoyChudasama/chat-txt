# Chat PDF Frontend

The frontend part of Chat PDF, built with React, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern UI with Tailwind CSS and Shadcn/ui components
- 📄 PDF file upload interface
- 💬 Real-time chat interface
- 📚 Session management with sidebar
- 🚀 Optimized performance with React hooks
- 📝 Form validation with Zod

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui Components
- Zod Validation

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── ChatForm.tsx  # Chat input form
│   │   ├── ChatHistory.tsx # Chat messages display
│   │   ├── FileUpload.tsx # PDF upload interface
│   │   └── Sidebar.tsx   # Session management
│   ├── types/
│   │   └── chat.ts       # TypeScript interfaces
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Component Documentation

### ChatForm
Handles user input and message submission.
- Features:
  - Real-time input validation
  - Enter key support for sending messages
  - Loading state handling
  - Error handling

### ChatHistory
Displays chat messages and AI responses.
- Features:
  - Message history display
  - Loading states
  - Error handling
  - Scroll management

### FileUpload
Manages PDF file uploads.
- Features:
  - Drag and drop support
  - File type validation
  - Upload progress
  - Error handling

### Sidebar
Manages chat sessions.
- Features:
  - Session list
  - New session creation
  - Session deletion
  - Active session highlighting

## API Integration

The frontend communicates with the backend through the following endpoints:

### Session Management
- `GET /api/v1/session/past` - Fetch past sessions
- `POST /api/v1/session` - Create new session
- `DELETE /api/v1/session/{session_id}` - Delete session

### File Operations
- `POST /api/v1/upload_file` - Upload PDF file

### Chat Operations
- `POST /api/v1/chat` - Send message and get response