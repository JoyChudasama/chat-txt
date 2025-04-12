import { useRef, useEffect, useState } from "react"
import { Message } from "./Message"
import { MessageType } from "@/types/chat"
import { Loader2 } from "lucide-react"
import { toast } from 'react-hot-toast'

interface ChatHistoryProps {
    messages: MessageType[];
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    currentChatId: string;
}

const sessionMessagesUrl = "http://localhost:8000/api/v1/session/messages";

export function ChatHistory({ messages, setMessages, currentChatId }: ChatHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [isLoading, setIsLoading] = useState(true)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const user_id = localStorage.getItem('userId') || '';
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(sessionMessagesUrl + "?user_id=" + user_id + "&session_id=" + currentChatId);
                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.detail || "Failed to fetch chat history")
                }
                
                const data = await response.json();
                const formattedMessages: MessageType[] = data.map((msg: any) => ({
                    type: msg.type,
                    content: msg.content
                }));
                
                setMessages(formattedMessages);
            } catch (error) {
                console.error("Error fetching chat history:", error);
                toast.error(error instanceof Error ? error.message : "Failed to fetch chat history")
            } finally {
                setIsLoading(false);
            }
        };

        if (currentChatId) {
            fetchChatHistory();
        }
    }, [currentChatId]);

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading chat history...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-12rem)] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="p-4">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    )
} 