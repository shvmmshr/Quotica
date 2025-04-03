'use client';

import { cn } from '@/lib/utils';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = 'error' in message && message.error;

  return (
    <div className={cn('flex w-full gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <Avatar className="h-8 w-8 rounded-full bg-primary/10">
          <AvatarFallback className="text-primary">
            <Bot size={16} />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          hasError && 'bg-destructive/10 text-destructive dark:text-red-300'
        )}
      >
        <div className="whitespace-pre-wrap break-words text-sm">
          {message.content}
          {hasError && (
            <div className="mt-2 text-xs font-medium">Error sending message. Please try again.</div>
          )}
        </div>
        <div className="mt-1 flex justify-end">
          <span className="text-[10px] opacity-50">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 rounded-full bg-primary/10">
          <AvatarFallback className="text-primary">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
