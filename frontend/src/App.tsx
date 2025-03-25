import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { Login } from "@/components/Login"
import { Navbar } from "@/components/Navbar"
import { useState, useEffect } from "react"
import { MessageType } from "@/types/chat"

const apiUrl = "http://localhost:8000/api/v1/chat"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
  }

  const onSendMessage = async (message: string, file?: File) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append("user_message", message)
    if (file) {
      formData.append("file", file)
    }

    try {
      const chatId = "chat1"
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
            content: message,
            fileName: file?.name
          },
          {
            type: "ai",
            content: data.ai_message,
            fileName: undefined
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
          <ChatHistory messages={messages} setMessages={setMessages} />
        </div>
        <ChatForm 
          setMessages={setMessages} 
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export default App
