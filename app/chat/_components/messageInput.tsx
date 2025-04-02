"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (!textareaRef.current) return;

    // Reset height to auto to get the correct scrollHeight
    textareaRef.current.style.height = "auto";

    // Calculate new height based on scrollHeight (with max-height constraint)
    const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
    textareaRef.current.style.height = `${newHeight}px`;

    // Set rows for styling/spacing
    setRows(message.split("\n").length);
  }, [message]);

  const sendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 border-t border-border/30 px-4 py-3 bg-card/30 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about generating a quote image..."
          rows={rows}
          className="min-h-[44px] max-h-[150px] resize-none rounded-xl border border-border/60 bg-background shadow-sm focus-visible:ring-1 focus-visible:ring-primary"
        />

        <Button
          onClick={sendMessage}
          disabled={!message.trim()}
          size="icon"
          className="shrink-0 rounded-full h-11 w-11 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <SendHorizonal size={18} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}
