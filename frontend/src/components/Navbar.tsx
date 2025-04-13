"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, CreditCard, LogOut } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface NavbarProps {
    onLogout: () => void;
    username?: string;
}

export function Navbar({ onLogout, username = "User" }: NavbarProps) {
    console.log(username)
    const userInitials = username
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <nav className="w-full shadow-sm">
            <div className="max-w-[60vw] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="ChatPDF" className="w-8 h-8" />
                    <h1 className="text-xl font-bold">ChatPDF</h1>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                            <Avatar>
                                <AvatarFallback className="bg-blue-500 text-white">
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{username}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    Free Plan
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem className="cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Subscription</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
} 