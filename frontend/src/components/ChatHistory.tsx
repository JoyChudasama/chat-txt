import { Loader2 } from "lucide-react"
import { useRef, useEffect } from "react"

type Message = {
    type: "human" | "ai" | "thinking";
    content: string;
}

interface ChatHistoryProps {
    messages: Message[];
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
                <div
                    key={index}
                    className={`p-4 mb-4 rounded-lg ${
                        msg.type === "human"
                            ? "bg-gray-100 ml-8"
                            : msg.type === "ai"
                            ? "bg-gray-200 mr-8"
                            : "ml-8"
                    }`}
                >
                    {msg.type === "thinking" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        msg.content
                    )}
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
} 