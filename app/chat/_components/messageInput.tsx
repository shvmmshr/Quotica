'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-adjust height
  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = 'auto'; // Reset height to recalculate
    const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [message]);

  const sendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 px-4 py-4 bg-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-center gap-3 p-3 bg-card/40 backdrop-blur-md rounded-2xl shadow-lg border border-border/40">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Quotica..."
          className="min-h-[52px] max-h-[200px] overflow-y-auto flex-1 px-5 py-3 rounded-xl border border-transparent bg-transparent focus-visible:ring-0 focus-visible:outline-none text-[16px] resize-none leading-relaxed"
          style={{ scrollbarWidth: 'thin' }}
        />

        <Button
          onClick={sendMessage}
          disabled={!message.trim()}
          size="icon"
          className="shrink-0 rounded-full h-12 w-12 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <ArrowUpIcon size={30} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  );
}
