import { useRef, useEffect } from "react"
import { Message } from "./Message"
import { MessageType } from "@/types/chat"

interface ChatHistoryProps {
    messages: MessageType[];
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
}

const apiUrl = "http://localhost:8000/api/v1/chat_history";

export function ChatHistory({ messages, setMessages }: ChatHistoryProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        const user_id = "user123";
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
            }
        };

        fetchChatHistory();
    }, []);

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