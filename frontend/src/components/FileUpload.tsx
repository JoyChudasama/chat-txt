import { Button } from "@/components/ui/button"
import { FileUp, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from 'react-hot-toast'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FileUploadProps {
    userId: string;
    sessionId: string;
    onFileUploaded: () => void;
    onUploadStateChange: (isUploading: boolean) => void;
}

interface FileUploadResponse {
    content: {
        type: string;
        message: string;
        file_name: string;
    };
}

async function createSession(userId: string, sessionId: string, title: string, file_name?: string) {
    await fetch(`http://localhost:8000/api/v1/session/create?user_id=${userId}&session_id=${sessionId}&title=${title}&file_name=${file_name}`, {
        method: "POST",
    })
}

export function FileUpload({ userId, sessionId: sessionId, onFileUploaded, onUploadStateChange }: FileUploadProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [chatWithoutFile, setChatWithoutFile] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const handleSubmit = async () => {
        if (!chatWithoutFile && !selectedFile) return

        setIsLoading(true)
        onUploadStateChange(true)
        
        
        try {
            if (chatWithoutFile) {
                await createSession(userId, sessionId, 'Title', '')
                onFileUploaded()
                toast.success("Chat session started without file")
            } else {
                await createSession(userId, sessionId, 'Title', selectedFile!.name)
                const formData = new FormData()
                formData.append("file", selectedFile!)

                const response = await fetch(`http://localhost:8000/api/v1/file/upload?user_id=${userId}&session_id=${sessionId}`, {
                    method: "POST",
                    body: formData,
                })

                const fileUploadResponse = await response.json() as FileUploadResponse

                if (!response.ok) {
                    throw new Error(fileUploadResponse.content.message || "Failed to upload file")
                }

                onFileUploaded()
                toast.success(fileUploadResponse.content.message)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to start chat session")
        } finally {
            setIsLoading(false)
            onUploadStateChange(false)
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Start Chatting</h2>
                <p className="text-gray-500">Choose how you want to start the conversation</p>
            </div>
            
            <div className="w-full max-w-md space-y-4">
                <RadioGroup 
                    defaultValue="with-file" 
                    className="flex gap-10 justify-center"
                    onValueChange={(value: string) => setChatWithoutFile(value === "without-file")}
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="with-file" id="with-file" className="cursor-pointer" />
                        <Label htmlFor="with-file" className="cursor-pointer">Chat with file</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="without-file" id="without-file" className="cursor-pointer" />
                        <Label htmlFor="without-file" className="cursor-pointer">Chat without file</Label>
                    </div>
                </RadioGroup>

                {!chatWithoutFile && (
                    <label
                        htmlFor="file-upload"
                        className={`flex items-center justify-center h-32 w-full gap-2 px-3 py-2 rounded-lg border-2 border-dashed
                            ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                    >
                        <FileUp className="h-8 w-8" />
                        <span className="text-lg font-medium">
                            {selectedFile ? selectedFile.name : "Click to upload Text File"}
                        </span>
                        <input
                            type="file"
                            id="file-upload"
                            accept=".txt"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={isLoading}
                        />
                    </label>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={(!chatWithoutFile && !selectedFile) || isLoading}
                    className="w-full cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {chatWithoutFile ? "Starting chat..." : "Processing file..."}
                        </>
                    ) : (
                        chatWithoutFile ? "Start Chatting" : "Upload and Start Chatting"
                    )}
                </Button>
            </div>
        </div>
    )
}