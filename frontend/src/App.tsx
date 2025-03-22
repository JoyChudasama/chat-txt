import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { Login } from "@/components/Login"
import { useState, useEffect } from "react"
import { MessageType } from "@/types/chat"
import { Button } from "@/components/ui/button"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [userId, setUserId] = useState<string | null>(null)

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

  if (!userId) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="flex flex-col h-screen max-w-[60vw] mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chat PDF</h1>
        <Button 
          variant="outline" 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
      <ChatHistory messages={messages} setMessages={setMessages} />
      <ChatForm setMessages={setMessages} userId={userId} />
    </div>
  )
}

export default App
