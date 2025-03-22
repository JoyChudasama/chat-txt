import { Loader2 } from "lucide-react"
import { MessageType } from "@/types/chat"

interface MessageProps {
    message: MessageType;
}

export function Message({ message }: MessageProps) {
    return (
        <div
            className={`p-4 mb-4 rounded-lg ${
                message.type === "human"
                    ? "bg-gray-100 ml-8"
                    : message.type === "ai"
                    ? "bg-gray-200 mr-8"
                    : "mr-8"
            }`}
        >
            {message.type === "thinking" ? (
                <Loader2 className="animate-spin" />
            ) : (
                message.content
            )}
        </div>
    )
} 