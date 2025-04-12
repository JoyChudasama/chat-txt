import { Button } from "@/components/ui/button"
import { MessageSquare, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from 'react-hot-toast'

interface Chat {
    session_id: string;
    title: string;
}

interface SidebarProps {
    userId: string;
    currentSessionId: string;
    onChatSelect: (sessionId: string) => void;
    onNewChat: () => void;
    isUploading?: boolean;
}

export function Sidebar({ userId, currentSessionId: currentSessionId, onChatSelect, onNewChat, isUploading = false }: SidebarProps) {
    const [sessions, setSessions] = useState<Chat[]>([])
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchChats = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/session/history?user_id=${userId}`)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to fetch chats")
            }
            const data = await response.json()
            setSessions(data)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to fetch chats")
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
            session_id: `session_${Date.now()}`,
            title: "Session " + (sessions.length + 1),
        }
        
        setSessions(prev => [newChat, ...prev])
        onNewChat()
        onChatSelect(newChat.session_id)
    }

    const handleChatSelect = (sessionId: string) => {
        if (isUploading) return;
        onChatSelect(sessionId)
    }

    const handleDeleteChat = async (sessionId: string) => {
        if (isUploading) return;
        
        try {
            const response = await fetch(`http://localhost:8000/api/v1/session/${sessionId}?user_id=${userId}`, {
                method: "DELETE"
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to delete Session")
            }
            
            setSessions(sessions.filter(chat => chat.session_id !== sessionId))
            
            if (currentSessionId === sessionId) {
                onChatSelect("")
            }
            toast.success("Session deleted successfully")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete Session")
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
                    {sessions.map((session) => (
                        <div
                            key={session.session_id}
                            className="relative group mb-1"
                            onMouseEnter={() => setHoveredChatId(session.session_id)}
                            onMouseLeave={() => setHoveredChatId(null)}
                        >
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={currentSessionId === session.session_id ? "secondary" : "ghost"}
                                    className="flex-1 justify-start gap-2 h-9 px-2"
                                    onClick={() => handleChatSelect(session.session_id)}
                                    disabled={isUploading}
                                >
                                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate text-sm">{session.title}</span>
                                </Button>
                                {hoveredChatId === session.session_id && !isUploading && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                                        onClick={() => handleDeleteChat(session.session_id)}
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