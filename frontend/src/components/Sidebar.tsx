import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, X, Trash2, Menu } from "lucide-react"
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
}

export function Sidebar({ userId, currentChatId, onChatSelect, onNewChat }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(true)
    const [chats, setChats] = useState<Chat[]>([])
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchChats = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/chats?user_id=${userId}`)
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
        fetchChats()
    }, [userId])

    const handleNewChat = () => {
        const newChat: Chat = {
            chat_id: `chat${Date.now()}`,
            title: "New Chat"
        }
        
        setChats(prev => [newChat, ...prev])
        onNewChat()
        onChatSelect(newChat.chat_id)
    }

    const handleChatSelect = (chatId: string) => {
        onChatSelect(chatId)
    }

    const handleDeleteChat = async (chatId: string) => {
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
            <div className="relative">
                {!isOpen && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(true)}
                        className="absolute left-4 top-4 z-50 h-8 w-8"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                )}
                <div className={`h-full bg-white border-r transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
                    <div className="h-full flex flex-col">
                        {isOpen && (
                            <div className="p-4 border-b flex items-center justify-between">
                                <h2 className="font-semibold">Sessions</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsOpen(false)}
                                    className="h-8 w-8"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>

                        {isOpen && (
                            <div className="p-4 border-t">
                                <Button
                                    className="w-full"
                                    onClick={handleNewChat}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    New Chat
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative">
            {!isOpen && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(true)}
                    className="absolute left-4 top-4 z-50 h-8 w-8"
                >
                    <Menu className="h-4 w-4" />
                </Button>
            )}
            <div className={`h-full bg-white border-r transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
                <div className="h-full flex flex-col">
                    {isOpen && (
                        <div className="p-4 border-b flex items-center justify-between">
                            <h2 className="font-semibold">Sessions</h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-2">
                        {chats.map((chat) => (
                            <div
                                key={chat.chat_id}
                                className="relative group"
                                onMouseEnter={() => setHoveredChatId(chat.chat_id)}
                                onMouseLeave={() => setHoveredChatId(null)}
                            >
                                <Button
                                    variant={currentChatId === chat.chat_id ? "secondary" : "ghost"}
                                    className="w-full justify-start gap-2 mb-1"
                                    onClick={() => handleChatSelect(chat.chat_id)}
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="truncate">{chat.title}</span>
                                </Button>
                                {hoveredChatId === chat.chat_id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDeleteChat(chat.chat_id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    {isOpen && (
                        <div className="p-4 border-t">
                            <Button
                                className="w-full"
                                onClick={handleNewChat}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Session
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 