'use client';

import { MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { forwardRef, useEffect } from 'react';
import ChatMessage from './chatMessage';
import { Message } from '../types';

interface MessagesListProps {
  messages: Message[];
  loading?: boolean;
  error?: string | null;
  isGeneratingImage?: boolean;
  chatLoaded?: boolean;
  isMobile?: boolean;
}

const MessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, loading, error, isGeneratingImage, chatLoaded, isMobile }, ref) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        if (ref && typeof ref !== 'function') {
          ref.current?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }, [messages, isGeneratingImage, chatLoaded, ref]);

    return (
      <div className="flex-1 overflow-y-auto py-4 flex flex-col scroll-smooth">
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
          <div className="flex flex-col items-center justify-center text-center p-4 sm:p-8">
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
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isMobile={isMobile} />
            ))}

            {isGeneratingImage && (
              <div className={`flex w-full gap-2 justify-start ${isMobile ? 'px-2' : 'px-[20%]'}`}>
                <div
                  className={`${isMobile ? 'max-w-[95%]' : 'max-w-[85%]'} rounded-2xl px-4 sm:px-6 py-3 bg-muted`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm sm:text-lg">
                    <div className="relative">
                      <div className="flex justify-center items-center w-full h-32 sm:h-40">
                        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-300 border-t-primary"></div>
                      </div>
                      <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2">
                        Generating your image...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={ref} className="h-1" />
      </div>
    );
  }
);

MessagesList.displayName = 'MessagesList';

export default MessagesList;
