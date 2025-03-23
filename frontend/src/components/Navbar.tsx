import { Button } from "@/components/ui/button"

interface NavbarProps {
    onLogout: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
    return (
        <nav className="w-full shadow-sm">
            <div className="max-w-[60vw] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/icon.png" alt="ChatPDF" className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-bold">ChatPDF</h1>
                <Button 
                    variant="ghost" 
                    onClick={onLogout}
                    className=" hover:bg-200 hover:text-white cursor-pointer"
                >
                    Logout
                </Button>
            </div>
        </nav>
    )
} 