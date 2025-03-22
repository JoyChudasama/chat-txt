import { useRef, useEffect, useState } from "react"
import { Message } from "./Message"
import { MessageType } from "@/types/chat"
import { Loader2 } from "lucide-react"

interface ChatHistoryProps {
    messages: MessageType[];
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

const apiUrl = "http://localhost:8000/api/v1/chat_history";

export function ChatHistory({ messages, setMessages }: ChatHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const user_id = localStorage.getItem('userId') || '';
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(apiUrl + "?user_id=" + user_id);
                if (!response.ok) throw new Error("Failed to fetch chat history");
                
                const data = await response.json();
                const formattedMessages: MessageType[] = data.map((msg: any) => ({
                    type: msg.type,
                    content: msg.content
                }));
                
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching chat history:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChatHistory();
    }, []);

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    <p className="text-gray-500">Loading chat history...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {messages.map((msg, index) => (
                <Message key={index} message={msg} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    )
} 