"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormField, FormItem } from './ui/form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useState, useEffect, useRef } from "react"
import { FileUp, Send, Loader2 } from "lucide-react"

const formSchema = z.object({
    userMessageInput: z.string(),
    fileInput: z.instanceof(File).optional(),
})

type Message = {
    type: "human" | "ai" | "thinking";
    content: string;
}

export function ChatForm() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [isMessageEmpty, setIsMessageEmpty] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userMessageInput: "",
            fileInput: undefined,
        },
    })

    async function onSendMessage(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        form.reset();
        setSelectedFile(null);
        setIsLoading(true);

        const formData = new FormData();
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        formData.append("user_message", values.userMessageInput);

        const newHumanMessage: Message = { type: "human", content: values.userMessageInput }
        setMessages((oldMessages) => [...oldMessages, newHumanMessage])

        const thinkingMessage: Message = { type: "thinking", content: "" }
        setMessages(oldMessages => [...oldMessages, thinkingMessage])

        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/chat", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload file");

            const res = await response.json();

            setMessages(oldMessages => {
                const filteredMessages = oldMessages.filter(msg => msg.type !== "thinking");
                return [...filteredMessages, { type: "ai", content: res.ai_message }];
            });
        } catch (error) {
            console.error(error);
            setMessages(oldMessages => oldMessages.filter(msg => msg.type !== "thinking"));
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const messageValue = form.getValues("userMessageInput").trim();
        setIsMessageEmpty(!messageValue);

        if (e.key === 'Enter' && !e.shiftKey && messageValue) {
            e.preventDefault();
            form.handleSubmit(onSendMessage)();
        }
    };

    const handleOnFocus = (e: React.FocusEvent) => {
        const messageValue = form.getValues("userMessageInput").trim();
        setIsMessageEmpty(!messageValue);
    }

    return (
        <div className="flex flex-col h-screen max-w-[60vw] mx-auto p-4">
            <div className="flex-1 overflow-y-auto p-4 mb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-4 mb-4 rounded-lg ${msg.type === "human"
                            ? "bg-gray-100 ml-8"
                            : ""
                            }`}
                    >
                        {msg.type === "thinking" ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </>
                        ) : (
                            msg.content
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSendMessage)}
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
                                            placeholder="Start chatting with your PDF"
                                            {...field}
                                            className="min-h-[60px] resize-none"
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

                        <div className="flex flex-col items-center gap-2">
                            {selectedFile && (
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-gray-500 truncate max-w-[100px]">
                                        {selectedFile.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedFile(null)}
                                        className="text-gray-500 hover:text-gray-700"
                                        disabled={isLoading}
                                    >
                                        <span className="h-4 w-4 text-red-500 cursor-pointer">x</span>
                                    </button>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="file-upload"
                                    disabled={isLoading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12"
                                    disabled={isLoading}
                                >
                                    <FileUp className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            size="icon"
                            className="h-12 w-12 cursor-pointer"
                            disabled={isLoading || isMessageEmpty}
                        >
                            <Send className="h-6 w-6" />
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
