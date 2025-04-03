'use client';

import { cn } from '@/lib/utils';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = 'error' in message && message.error;

  return (
    <div
      className={cn('flex w-full gap-2', isUser ? 'justify-end' : 'justify-start')}
      style={{ paddingLeft: '20%', paddingRight: '20%' }} // Adjust percentages as needed
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-6 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          hasError && 'bg-destructive/10 text-destructive dark:text-red-300'
        )}
      >
        <div className="whitespace-pre-wrap break-words text-lg">
          {message.content}
          {hasError && (
            <div className="mt-2 text-xs font-medium">Error sending message. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
}
