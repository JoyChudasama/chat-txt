import { useRef, useEffect } from "react"
import { Message } from "./Message"
import { MessageType } from "@/types/chat"

interface ChatHistoryProps {
    messages: MessageType[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    return (
        <div className="flex-1 overflow-y-auto p-4 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((msg, index) => (
                <Message key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
} 