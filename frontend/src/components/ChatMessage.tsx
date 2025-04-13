"use client"

import { MessageType } from "@/types/chat"

interface ChatMessageProps {
    message: MessageType;
    isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
    const LoadingDots = () => (
        <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
    );

    if (message.type === "thinking") {
        return (
            <div className="flex justify-start mb-4">
                <div className="bg-gray-200 rounded-lg px-4 py-3">
                    <LoadingDots />
                </div>
            </div>
        );
    }

    return message.content ? (
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
            </div>
        </div>
    ) : null;
} 