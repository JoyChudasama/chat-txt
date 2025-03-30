import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { Login } from "@/components/Login"
import { Navbar } from "@/components/Navbar"
import { FileUpload } from "@/components/FileUpload"
import { Sidebar } from "@/components/Sidebar"
import { useState, useEffect } from "react"
import { MessageType } from "@/types/chat"

const apiUrl = "http://localhost:8000/api/v1/chat"
const chatHistoryUrl = "http://localhost:8000/api/v1/chat_history"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFileUploaded, setIsFileUploaded] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>("")
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

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
    if (!userId) return false
    
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`${chatHistoryUrl}?user_id=${userId}&chat_id=${chatId}`)
      if (!response.ok) throw new Error("Failed to fetch chat history")
      const data = await response.json()
      return data.length > 0
    } catch (error) {
      console.error("Error checking chat history:", error)
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

  const onSendMessage = async (message: string) => {
    if (!currentChatId) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("user_message", message)

    try {
      const response = await fetch(`${apiUrl}?user_id=${userId}&chat_id=${currentChatId}`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to send message")

      const data = await response.json()
      setMessages(oldMessages => {
        const filteredMessages = oldMessages.filter(msg => msg.type !== "thinking" && msg.content !== message)
        return [
          ...filteredMessages,
          {
            type: "human",
            content: message
          },
          {
            type: "ai",
            content: data.ai_message
          }
        ]
      })
    } catch (error) {
      console.error(error)
      setMessages(oldMessages => oldMessages.filter(msg => msg.type !== "thinking"))
    } finally {
      setIsLoading(false)
    }
  }

  if (!userId) {
    return <Login onLogin={handleLogin} />
  }
  
  return (
    <div className="h-screen overflow-hidden">
      <Navbar onLogout={handleLogout} />
      <div className="h-[calc(100vh-4rem)] flex">
        <Sidebar 
          userId={userId}
          currentChatId={currentChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
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
                  chatId={currentChatId}
                  onFileUploaded={handleFileUploaded} 
                />
              ) : (
                <ChatHistory 
                  messages={messages} 
                  setMessages={setMessages}
                  currentChatId={currentChatId}
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Select a chat or create a new one to start</p>
              </div>
            )}
          </div>
          {currentChatId && isFileUploaded && (
            <ChatForm 
              setMessages={setMessages} 
              onSendMessage={onSendMessage}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
