'use client';
import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatHeader from './chatHeader';
import MessagesList from './messagesList';
import MessageInput from './messageInput';
import { ChatSession as Chat, Message } from './types';
import { v4 as uuid } from 'uuid';
interface ChatMainAreaProps {
  currentChat: Chat | null;
  onCreateNewChat: () => void;
  theme: string | undefined;
}

export default function ChatMainArea({ currentChat, onCreateNewChat, theme }: ChatMainAreaProps) {
  const [messages, setMessages] = useState<Message[]>(currentChat?.messages || []);

  console.log('currentChat', currentChat);
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    }
  }, [currentChat]);

  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `/api/chat/${currentChat.id}/messages?&clerkId=${currentChat.userId}`
        );
        if (!res.ok) throw new Error('Failed to fetch messages');

        const data: Message[] = await res.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
      }
    };

    fetchMessages();
  }, [currentChat]); // Run when currentChat changes

  const clerkId = currentChat?.userId;
  console.log('clerkId', clerkId);
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentChat) return;

    // Create a temporary message object
    const tempMessage: Message = {
      id: `temp-${uuid()}`, // Temporary ID
      chatSessionId: currentChat.id,
      content,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      const res = await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: currentChat.userId, content }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const newMessages: Message[] = await res.json();

      // Replace temp message with actual messages from API
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== tempMessage.id).concat(newMessages)
      );
    } catch (error) {
      console.error('Error sending message:', error);

      // Optionally show error UI (e.g., mark message as failed)
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {currentChat ? (
        <>
          <ChatHeader title={currentChat.title} theme={theme} />
          <MessagesList messages={messages} theme={theme} />
          <MessageInput theme={theme} onSendMessage={handleSendMessage} />
        </>
      ) : (
        <EmptyState onCreateNewChat={onCreateNewChat} theme={theme} />
      )}
    </div>
  );
}

function EmptyState({
  onCreateNewChat,
  theme,
}: {
  onCreateNewChat: () => void;
  theme: string | undefined;
}) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden">
      <div className="text-center max-w-md p-8">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-medium mb-2">Welcome to Quotify Chat</h3>
        <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Start a new chat or select an existing chat from the sidebar.
        </p>
        <button
          onClick={onCreateNewChat}
          className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          Start New Chat
        </button>
      </div>
    </div>
  );
}
