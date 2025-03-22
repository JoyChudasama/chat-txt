import { Loader2 } from "lucide-react"
import { MessageType } from "@/types/chat"

interface MessageProps {
    message: MessageType;
}

export function Message({ message }: MessageProps) {
    return (
        <div
            className={`p-4 mb-4 rounded-lg max-w-[70%]  ${
                message.type === "human"
                    ? "outline outline-gray-200 ml-auto w-1/2"
                    : "font-mono"
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