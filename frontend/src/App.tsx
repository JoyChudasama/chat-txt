import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { Login } from "@/components/Login"
import { Navbar } from "@/components/Navbar"
import { FileUpload } from "@/components/FileUpload"
import { Sidebar } from "@/components/Sidebar"
import { useState, useEffect } from "react"
import { MessageType } from "@/types/chat"
import { WebSocketProvider } from "@/contexts/WebSocketContext"
import { useWebSocket } from "@/contexts/WebSocketContext"
import { Toaster } from 'react-hot-toast'

const chatHistoryUrl = "http://localhost:8000/api/v1/session/messages"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    }
  }, [])

  const handleLogin = (newUserId: string) => {
    setUserId(newUserId)
    localStorage.setItem('userId', newUserId)
  }
 
  const handleLogout = () => {
    setUserId(null)
    localStorage.removeItem('userId')
    setMessages([])
    setIsFileUploaded(false)
    setCurrentChatId("")
  }

  const handleFileUploaded = () => {
    setIsFileUploaded(true)
    setMessages([{
      type: "ai",
      content: "File uploaded successfully. You can now start chatting with your PDF."
    }])
  }

  const checkChatHistory = async (chatId: string) => {
    if (!userId || !chatId) return false
    
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`${chatHistoryUrl}?user_id=${userId}&session_id=${chatId}`)
      if (!response.ok) throw new Error("Failed to fetch chat history")
      const data = await response.json()
      return data.length > 0
    } catch (error) {
      return false
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleChatSelect = async (chatId: string) => {
    setCurrentChatId(chatId)
    setMessages([])
    setIsFileUploaded(false)
    
    // Check if this is an existing chat with history
    const hasHistory = await checkChatHistory(chatId)
    if (hasHistory) {
      setIsFileUploaded(true)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setIsFileUploaded(false)
  }

  if (!userId) {
    return <Login onLogin={handleLogin} />
  }
  
  return (
    <div className="h-screen overflow-hidden">
      <Toaster position="top-right" />
      <Navbar onLogout={handleLogout} username={userId} />
      <div className="h-[calc(100vh-4rem)] flex">
        <Sidebar 
          userId={userId}
          currentSessionId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isUploading={isUploading}
        />
        <div className="flex-1 max-w-[60vw] mx-auto w-full p-4 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {currentChatId ? (
              isLoadingHistory ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <p>Loading chat...</p>
                  </div>
                </div>
              ) : !isFileUploaded ? (
                <FileUpload 
                  userId={userId} 
                  sessionId={currentChatId}
                  onFileUploaded={handleFileUploaded}
                  onUploadStateChange={setIsUploading}
                />
              ) : (
                <WebSocketProvider userId={userId} sessionId={currentChatId}>
                  <ChatComponents 
                    messages={messages} 
                    setMessages={setMessages}
                    currentChatId={currentChatId}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    onLogout={handleLogout}
                  />
                </WebSocketProvider>
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Select a session or create a new one to start</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate component to access WebSocket context
function ChatComponents({ 
  messages, 
  setMessages, 
  currentChatId, 
  isLoading, 
  setIsLoading,
  onLogout,
}: { 
  messages: MessageType[]; 
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  currentChatId: string;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: () => void;
}) {
  const { closeConnection } = useWebSocket();

  const handleLogout = () => {
    closeConnection();
    onLogout();
  };

  return (
    <>
      <ChatHistory 
        messages={messages} 
        setMessages={setMessages}
        currentChatId={currentChatId}
      />
      <ChatForm 
        setMessages={setMessages} 
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </>
  );
}

export default App
