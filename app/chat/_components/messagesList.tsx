import { MessageSquare } from 'lucide-react';
import ChatMessage from './chatMessage';
import { Message } from './types';

interface MessagesListProps {
  messages: Message[];
  theme: string | undefined;
}

export default function MessagesList({ messages, theme }: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-2 max-h-[calc(100vh-132px)]">
      {messages?.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-center max-w-md">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-medium mb-2">Start a new conversation</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Type a message below to start chatting with the assistant.
            </p>
          </div>
        </div>
      ) : (
        messages?.map((msg) => <ChatMessage key={msg.id} message={msg} theme={theme} />)
      )}
    </div>
  );
}
