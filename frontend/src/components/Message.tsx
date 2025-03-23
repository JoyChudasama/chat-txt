import { Loader2, FileUp } from "lucide-react"
import { MessageType } from "@/types/chat"

interface MessageProps {
    message: MessageType;
}

export function Message({ message }: MessageProps) {
    return (
        <div
            className={`p-2 pt-4 pb-4 mb-4 rounded-lg max-w-[70%]  ${
                message.type === "human"
                    ? "outline outline-gray-300 ml-auto w-1/2"
                    : "font-mono"
            }`}
        >
            {message.type === "thinking" ? (
                <Loader2 className="animate-spin" />
            ) : (
                <>
                    <span className={`${message.type === "human" ? "text-gray-500" : "text-gray-800 italic"}`}>{message.content}</span>
                    {message.fileName && (
                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-500">
                            <FileUp className="h-4 w-4" />
                            <span className="truncate">Reply Generated using {message.fileName}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    )
} 