"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormField, FormItem, FormMessage } from './ui/form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useState } from "react"

const formSchema = z.object({
    userMessageInput: z.string().min(3, "Message must be at least 3 characters long"),
    fileInput: z.instanceof(File).optional(),
})

export function ChatForm() {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [messages, setMessages] = useState([{}])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userMessageInput: "",
            fileInput: undefined,
        },
    })

    async function onSendMessage(values: z.infer<typeof formSchema>) {
        form.reset();
        setSelectedFile(null);

        const formData = new FormData();
        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        formData.append("user_message", values.userMessageInput);

        const newHumanMessage = { "type": "human", "content": values.userMessageInput }
        setMessages((oldMessages) => [...oldMessages, newHumanMessage])

        try {
            const response = await fetch("http://127.0.0.1:8000/api/v1/chat", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload file");

            const res = await response.json();
            const newAiMessage = { "type": "ai", "content": res.ai_message }
            setMessages(oldMessages => [...oldMessages, newAiMessage])

            console.log(res);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            {messages.map((msg, index) => (
                <div key={index}>
                    {msg.type} {msg.content}
                </div>
            ))}
            
            <div className="card">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSendMessage)} encType="multipart/form-data" className="space-y-8">
                        <FormField
                            control={form.control}
                            name="userMessageInput"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea placeholder="Start chatting with your PDF" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormControl>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </>
    )
}
