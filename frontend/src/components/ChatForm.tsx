"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormControl, FormField, FormItem } from './ui/form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"
import { useState, useEffect } from "react"
import { Send } from "lucide-react"
import { MessageType } from "@/types/chat"
import { useWebSocket } from "@/contexts/WebSocketContext"

const formSchema = z.object({
    userMessageInput: z.string(),
})

interface ChatFormProps {
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatForm({ setMessages, isLoading, setIsLoading }: ChatFormProps) {
    const [isMessageEmpty, setIsMessageEmpty] = useState(true);
    const { sendMessage, lastMessage, streamingContent, isStreaming } = useWebSocket();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userMessageInput: "",
        },
    })

    useEffect(() => {
        if (lastMessage) {
            setMessages(prevMessages => {
                const messagesWithoutThinking = prevMessages.filter(msg => msg.type !== 'thinking');
                return [...messagesWithoutThinking, { type: 'ai', content: lastMessage.ai_message }];
            });
            setIsLoading(false);
        }
    }, [lastMessage, setMessages, setIsLoading]);

    useEffect(() => {
        if (isStreaming && streamingContent) {
            setMessages(prevMessages => {
                const messagesWithoutThinking = prevMessages.filter(msg => msg.type !== 'thinking');
                const messagesWithoutLastAI = messagesWithoutThinking.filter((msg, index) => 
                    !(msg.type === 'ai' && index === messagesWithoutThinking.length - 1)
                );
                return [...messagesWithoutLastAI, { type: 'ai', content: streamingContent }];
            });
        }
    }, [streamingContent, isStreaming, setMessages]);

    async function handleSubmit(values: z.infer<typeof formSchema>) {
        if (isLoading) return;

        form.reset();
        setIsMessageEmpty(!values.userMessageInput.trim());

        const newHumanMessage: MessageType = { type: "human", content: values.userMessageInput };
        const thinkingMessage: MessageType = { type: "thinking", content: "" };
        
        setMessages(oldMessages => [...oldMessages, newHumanMessage, thinkingMessage]);
        setIsLoading(true);
        sendMessage(values.userMessageInput);
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
