'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Message } from '../types';
import Image from 'next/image';
interface ChatMessageProps {
  message: Message;
  isMobile?: boolean;
}

export default function ChatMessage({ message, isMobile = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = message.error;
  const hasImage = !!message.imageUrl;
  const hasContent = !!message.content;
  const hasPrompt = !!message.promt;

  const [imageLoading, setImageLoading] = useState(hasImage);
  const [imageError, setImageError] = useState(false);

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
          {/* Show prompt if available (for user messages) */}

          {/* Image display */}
          {hasImage && (
            <div className="relative mb-2">
              {imageLoading && (
                <div className="flex justify-center items-center w-full h-32 sm:h-40">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-300 border-t-primary"></div>
                </div>
              )}

              {!imageError && (
                <div
                  className={cn(imageLoading ? 'hidden' : 'block', 'relative w-full max-h-[400px]')}
                >
                  <Image
                    src={message.imageUrl!}
                    alt={message.promt || 'Generated image'}
                    width={800}
                    height={400}
                    className="rounded-lg object-contain w-full h-auto max-h-[400px]"
                    onLoadingComplete={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                </div>
              )}

              {imageError && (
                <div className="text-center p-4 text-red-500">Failed to load image</div>
              )}
            </div>
          )}

          {/* Text content */}
          {hasContent && (
            <div className={hasImage || hasPrompt ? 'mt-2' : ''}>{message.content}</div>
          )}

          {/* Error message */}
          {hasError && (
            <div className="mt-2 text-xs font-medium">Error sending message. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
}
