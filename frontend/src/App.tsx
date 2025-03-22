import './App.css'
import { ChatForm } from "@/components/ChatForm"
import { ChatHistory } from "@/components/ChatHistory"
import { useState } from "react"

type Message = {
    type: "human" | "ai" | "thinking";
    content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])

  return (
    <div className="flex flex-col h-screen max-w-[60vw] mx-auto p-4">
      <ChatHistory messages={messages} />
      <ChatForm setMessages={setMessages} />
    </div>
  )
}

export default App
