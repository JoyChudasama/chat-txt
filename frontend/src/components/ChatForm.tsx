"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormField, FormItem } from './ui/form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useState } from "react"
import { FileUp, Send, X } from "lucide-react"
import { MessageType } from "@/types/chat"

const formSchema = z.object({
    userMessageInput: z.string(),
    fileInput: z.instanceof(File).optional(),
})

interface ChatFormProps {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    onSendMessage: (message: string, file?: File) => void;
    isLoading: boolean;
}

export function ChatForm({ setMessages, onSendMessage, isLoading }: ChatFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isMessageEmpty, setIsMessageEmpty] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userMessageInput: "",
            fileInput: undefined,
        },
    })

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        form.reset();
        setSelectedFile(null);
        setIsMessageEmpty(!values.userMessageInput.trim());

        const formData = new FormData();
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        formData.append("user_message", values.userMessageInput);

        const newHumanMessage: MessageType = { type: "human", content: values.userMessageInput, fileName: selectedFile?.name }
        setMessages((oldMessages) => [...oldMessages, newHumanMessage])

        const thinkingMessage: MessageType = { type: "thinking", content: "" }
        setMessages(oldMessages => [...oldMessages, thinkingMessage])

        onSendMessage(values.userMessageInput, selectedFile || undefined);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const messageValue = form.getValues("userMessageInput").trim();
        setIsMessageEmpty(!messageValue);

        if (e.key === 'Enter' && !e.shiftKey && messageValue) {
            e.preventDefault();
            form.handleSubmit(handleSubmit)();
        }
    };

    const handleOnFocus = (e: React.FocusEvent) => {
        const messageValue = form.getValues("userMessageInput").trim();
        setIsMessageEmpty(!messageValue);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }

    return (
        <div className="sticky bottom-5 bg-white pr-2 rounded-2xl shadow-md">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    encType="multipart/form-data"
                    className="flex gap-4 items-end justify-between max-w-full mx-auto"
                >
                    <FormField
                        control={form.control}
                        name="userMessageInput"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea
                                        value={field.value}
                                        placeholder="Start chatting with your PDF"
                                        className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0 text-lg placeholder:text-lg"
                                        onFocus={handleOnFocus}
                                        onKeyDown={handleKeyDown}
                                        onChange={(e) => {
                                            field.onChange(e);
                                            setIsMessageEmpty(!e.target.value.trim());
                                        }}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <div className="flex flex-col items-center gap-2 py-2">

                        {selectedFile && (
                            <div className="absolute right-0 bottom-28 flex items-center gap-1 bg-white p-2 rounded-lg shadow-md border border-gray-200">
                                <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {selectedFile.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                    disabled={isLoading}
                                >
                                    <X className="h-4 w-4 text-red-500 cursor-pointer" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center">
                            <label
                                htmlFor="file-upload"
                                className={`flex items-center h-10 w-20 gap-2 px-3 py-2 rounded-md border-dashed border border-gray-300
                                    ${isLoading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`
                                }
                            >
                                <FileUp className="h-4 w-4" />
                                <span className="text-sm font-medium">PDF</span>
                                <input
                                    type="file"
                                    id="file-upload"
                                    accept=".txt"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </label>
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-20 cursor-pointer"
                            disabled={isLoading || isMessageEmpty}
                        >
                            <Send className="h-6 w-6 " />
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    )
}
