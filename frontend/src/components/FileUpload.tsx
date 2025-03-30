import { Button } from "@/components/ui/button"
import { FileUp, Loader2 } from "lucide-react"
import { useState } from "react"

interface FileUploadProps {
    userId: string;
    onFileUploaded: () => void;
}

export function FileUpload({ userId, onFileUploaded }: FileUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsLoading(true)
        const formData = new FormData()
        formData.append("file", selectedFile)
        const chatId = "chat2"

        try {
            const response = await fetch(`http://localhost:8000/api/v1/upload_file?user_id=${userId}&chat_id=${chatId}`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || "Failed to upload file")
            }

            onFileUploaded()
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Welcome to Chat PDF</h2>
                <p className="text-gray-500">Please upload a PDF file to start chatting</p>
            </div>
            
            <div className="w-full max-w-md space-y-4">
                <label
                    htmlFor="file-upload"
                    className={`flex items-center justify-center h-32 w-full gap-2 px-3 py-2 rounded-lg border-2 border-dashed
                        ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                >
                    <FileUp className="h-8 w-8" />
                    <span className="text-lg font-medium">
                        {selectedFile ? selectedFile.name : "Click to upload PDF"}
                    </span>
                    <input
                        type="file"
                        id="file-upload"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={isLoading}
                    />
                </label>

                <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || isLoading}
                    className="w-full"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        "Upload and Start Chatting"
                    )}
                </Button>
            </div>
        </div>
    )
} 