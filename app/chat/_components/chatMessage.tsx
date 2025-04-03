'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = 'error' in message && message.error;
  const isImage = message?.content?.startsWith('https://');

  const [loading, setLoading] = useState(isImage); // Start loading if it's an image
  const [error, setError] = useState(false); // Track error state

  return (
    <div
      className={cn('flex w-full gap-2', isUser ? 'justify-end' : 'justify-start')}
      style={{ paddingLeft: '20%', paddingRight: '20%' }}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-6 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          hasError && 'bg-destructive/10 text-destructive dark:text-red-300'
        )}
      >
        <div className="whitespace-pre-wrap break-words text-lg">
          {isImage ? (
            <div className="relative">
              {/* Loading spinner */}
              {loading && (
                <div className="flex justify-center items-center w-full h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-primary"></div>
                </div>
              )}

              {/* Image */}
              {!error && (
                <img
                  src={message.content}
                  alt="Generated"
                  className={cn('rounded-lg', loading ? 'hidden' : 'block')}
                  onLoad={() => setLoading(false)} // Hide spinner when loaded
                  onError={() => {
                    setLoading(false);
                    setError(true);
                  }} // Handle error
                />
              )}

              {/* Error message if image fails */}
              {error && <p className="text-red-500">Failed to load image</p>}
            </div>
          ) : (
            message.content
          )}

          {hasError && (
            <div className="mt-2 text-xs font-medium">Error sending message. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
}
