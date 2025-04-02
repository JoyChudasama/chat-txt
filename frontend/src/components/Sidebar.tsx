import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"

interface Chat {
    chat_id: string;
    title: string;
}

interface SidebarProps {
    userId: string;
    currentChatId: string;
    onChatSelect: (chatId: string) => void;
    onNewChat: () => void;
    isUploading?: boolean;
}

export function Sidebar({ userId, currentChatId, onChatSelect, onNewChat, isUploading = false }: SidebarProps) {
    const [chats, setChats] = useState<Chat[]>([])
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchChats = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/session/past?user_id=${userId}`)
            if (!response.ok) throw new Error("Failed to fetch chats")
            const data = await response.json()
            setChats(data)
        } catch (error) {
            console.error("Error fetching chats:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userId) {
            fetchChats()
        }
    }, [userId])

    const handleNewChat = () => {
        if (isUploading) return;
        
        const newChat: Chat = {
            chat_id: `chat_${Date.now()}`,
            title: "Chat " + (chats.length + 1)
        }
        
        setChats(prev => [newChat, ...prev])
        onNewChat()
        onChatSelect(newChat.chat_id)
    }

    const handleChatSelect = (chatId: string) => {
        if (isUploading) return;
        onChatSelect(chatId)
    }

    const handleDeleteChat = async (chatId: string) => {
        if (isUploading) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/v1/chat/${chatId}?user_id=${userId}`, {
                method: "DELETE"
            })
            
            if (!response.ok) throw new Error("Failed to delete chat")
            
            setChats(chats.filter(chat => chat.chat_id !== chatId))
            
            if (currentChatId === chatId) {
                onChatSelect("")
            }
        } catch (error) {
            console.error("Error deleting chat:", error)
        }
    }

    if (isLoading) {
        return (
            <div className="w-64 bg-white rounded-2xl shadow-lg mx-4 my-6">
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="font-semibold"></h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                        <div className="space-y-2">
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>

                    <div className="p-4 border-t">
                        <Button
                            className="w-full"
                            onClick={handleNewChat}
                            disabled={isUploading}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Chat
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-64 bg-white rounded-2xl shadow-lg mx-4 my-6">
            <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="font-semibold">Sessions</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {chats.map((chat) => (
                        <div
                            key={chat.chat_id}
                            className="relative group mb-1"
                            onMouseEnter={() => setHoveredChatId(chat.chat_id)}
                            onMouseLeave={() => setHoveredChatId(null)}
                        >
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={currentChatId === chat.chat_id ? "secondary" : "ghost"}
                                    className="flex-1 justify-start gap-2 h-9 px-2"
                                    onClick={() => handleChatSelect(chat.chat_id)}
                                    disabled={isUploading}
                                >
                                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate text-sm">{chat.title}</span>
                                </Button>
                                {hoveredChatId === chat.chat_id && !isUploading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                                        onClick={() => handleDeleteChat(chat.chat_id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t">
                    <Button
                        className="w-full cursor-pointer"
                        onClick={handleNewChat}
                        disabled={isUploading}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Session
                    </Button>
                </div>
            </div>
        </div>
    )
} 