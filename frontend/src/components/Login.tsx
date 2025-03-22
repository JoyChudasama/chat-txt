import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LoginProps {
    onLogin: (userId: string) => void;
}

export function Login({ onLogin }: LoginProps) {
    const [userId, setUserId] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (userId.trim()) {
            onLogin(userId.trim())
        }
    }

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center mb-6">Welcome to Chat PDF</h1>
                <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="Username"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Button type="submit" className="w-full">
                    Login
                </Button>
            </form>
        </div>
    )
} 