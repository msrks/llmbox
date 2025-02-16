"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatPage() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit: handleChatSubmit,
  } = useChat({
    api: "/api/chat",
  });

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto border rounded-lg p-4 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Chat</h2>

        <div className="h-[400px] overflow-y-auto space-y-4 mb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </div>
  );
}
