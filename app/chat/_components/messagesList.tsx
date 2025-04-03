'use client';

import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { forwardRef } from 'react';
import ChatMessage from './chatMessage';
import { Message } from '../types';

interface MessagesListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
}

const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, loading, error }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto py-4 px-4 sm:px-6 flex flex-col">
        <div className="flex-1 flex flex-col justify-end min-h-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-6 rounded-lg bg-destructive/10 mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                There was an error loading messages. Please try again.
              </p>
            </div>
          ) : messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-8 mt-auto">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start a new conversation</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask about generating quote images, or type what kind of quote image you want to
                create.
              </p>
            </div>
          ) : (
            <div className="space-y-6 mt-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
            </div>
          )}

          {/* This is the invisible element that we'll scroll to */}
          <div ref={ref} className="h-1" />
        </div>
      </div>
    );
  }
);

MessagesList.displayName = 'MessagesList';

export default MessagesList;
