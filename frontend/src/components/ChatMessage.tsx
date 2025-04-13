"use client"

import { MessageType } from "@/types/chat"

interface ChatMessageProps {
    message: MessageType;
    isFileUploaded: boolean;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isFileUploaded, isStreaming = false }: ChatMessageProps) {

    if(!message.content) return ''

    return (
        
        <div className={`flex ${message.type === "human" ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.type === "human"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                }`}
            >
                <p className="text-sm">
                    {message.content}
                    {isStreaming && <span className="animate-pulse">▋</span>}
                </p>
                {!isFileUploaded && message.type === "ai" ? (
                    <p className="text-xs mt-2 text-gray-500 text-end">
                        Chatting without file
                    </p>
                ) : ''}
            </div>
        </div>
    )
} 