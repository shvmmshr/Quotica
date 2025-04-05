'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isMobile?: boolean;
}

export default function ChatMessage({ message, isMobile = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = 'error' in message && message.error;
  const isImage = message?.content?.startsWith('https://');

  const [loading, setLoading] = useState(isImage); // Start loading if it's an image
  const [error, setError] = useState(false); // Track error state

  return (
    <div
      className={cn('flex w-full gap-2', isUser ? 'justify-end' : 'justify-start')}
      style={{
        paddingLeft: isMobile ? '2%' : '20%',
        paddingRight: isMobile ? '2%' : '20%',
      }}
    >
      <div
        className={cn(
          isMobile ? 'max-w-[95%]' : 'max-w-[85%]',
          'rounded-2xl px-4 sm:px-6 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          hasError && 'bg-destructive/10 text-destructive dark:text-red-300'
        )}
      >
        <div className={cn('whitespace-pre-wrap break-words', isMobile ? 'text-sm' : 'text-lg')}>
          {isImage ? (
            <div className="relative">
              {/* Loading spinner */}
              {loading && (
                <div className="flex justify-center items-center w-full h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-300 border-t-primary"></div>
                </div>
              )}

              {/* Image */}
              {!error && (
                <img
                  src={message.content}
                  alt="Generated"
                  className={cn('rounded-lg w-full', loading ? 'hidden' : 'block')}
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
