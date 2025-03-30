import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { Login } from "@/components/Login"
import { Navbar } from "@/components/Navbar"
import { FileUpload } from "@/components/FileUpload"
import { useState, useEffect } from "react"
import { MessageType } from "@/types/chat"

const apiUrl = "http://localhost:8000/api/v1/chat"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFileUploaded, setIsFileUploaded] = useState(false)

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
  }

  const handleFileUploaded = () => {
    setIsFileUploaded(true)
  }

  const onSendMessage = async (message: string) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("user_message", message)
    const chatId = "chat2"
    try {
      const response = await fetch(`${apiUrl}?user_id=${userId}&chat_id=${chatId}`, {
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
      <div className="h-[calc(100vh-4rem)] max-w-[60vw] mx-auto w-full p-4 flex flex-col">
        <div className="flex-1 overflow-hidden">
          {isFileUploaded ? (
            <ChatHistory messages={messages} setMessages={setMessages} />
          ) : (
            <FileUpload userId={userId} onFileUploaded={handleFileUploaded} />
          )}
        </div>
        {isFileUploaded && (
          <ChatForm 
            setMessages={setMessages} 
            onSendMessage={onSendMessage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  )
}

export default App
