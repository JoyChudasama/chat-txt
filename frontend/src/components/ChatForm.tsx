"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormField, FormItem } from './ui/form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useState } from "react"
import { Send } from "lucide-react"
import { MessageType } from "@/types/chat"

const formSchema = z.object({
    userMessageInput: z.string(),
})

interface ChatFormProps {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export function ChatForm({ setMessages, onSendMessage, isLoading }: ChatFormProps) {
    const [isMessageEmpty, setIsMessageEmpty] = useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userMessageInput: "",
        },
    })

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        form.reset();
        setIsMessageEmpty(!values.userMessageInput.trim());

        const newHumanMessage: MessageType = { type: "human", content: values.userMessageInput }
        setMessages((oldMessages) => [...oldMessages, newHumanMessage])

        const thinkingMessage: MessageType = { type: "thinking", content: "" }
        setMessages(oldMessages => [...oldMessages, thinkingMessage])

        onSendMessage(values.userMessageInput);
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

    return (
        <div className="sticky bottom-5 bg-white pr-2 rounded-2xl shadow-md">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex gap-4 justify-between items-center max-w-full mx-auto"
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
                                        className="min-h-[80px] resize-none border-none shadow-none focus-visible:ring-0 placeholder:text-base text-base"
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

                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-20 cursor-pointer"
                        disabled={isLoading || isMessageEmpty}
                    >
                        <Send className="h-6 w-6" />
                    </Button>
                </form>
            </Form>
        </div>
    )
}
