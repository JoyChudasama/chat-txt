import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { useState } from "react"
import { MessageType } from "@/types/chat"

function App() {
  const [messages, setMessages] = useState<MessageType[]>([])

  return (
    <div className="flex flex-col h-screen max-w-[60vw] mx-auto p-4">
      <ChatHistory messages={messages} setMessages={setMessages} />
      <ChatForm setMessages={setMessages} />
    </div>
  )
}

export default App
