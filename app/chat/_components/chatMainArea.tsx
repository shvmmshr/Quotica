'use client';
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatHeader from './chatHeader';
import MessagesList from './messagesList';
import MessageInput from './messageInput';
import { ChatSession as Chat, Message } from '../types';
import { v4 as uuid } from 'uuid';
import { models, DEFAULT_MODEL } from '@/lib/models';
import { useCredits } from '@/app/context/creditsContext';
interface ChatMainAreaProps {
  currentChat: Chat | null;
  onCreateNewChat: () => void;
}

export default function ChatMainArea({ currentChat, onCreateNewChat }: ChatMainAreaProps) {
  const [messages, setMessages] = useState<Message[]>(currentChat?.messages || []);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { deductCredits } = useCredits();

  useEffect(() => {
    if (currentChat) {
      setChatLoaded(true);
    }
  }, [currentChat]);
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
    }
  }, [currentChat]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!currentChat) return;

      setMessages([]); // Clear messages immediately

      try {
        setLoading(true);
        const res = await fetch(
          `/api/chat/${currentChat.id}/messages?&clerkId=${currentChat.userId}`
        );

        if (!res.ok) throw new Error('Failed to fetch messages');
        const data: Message[] = await res.json();

        if (isMounted) {
          setMessages(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(`Failed to fetch messages ${err}`);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentChat]);
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string, selectedModel: string) => {
    if (!content.trim() || !currentChat) return;
    const modelData = models[selectedModel as keyof typeof models] || models[DEFAULT_MODEL];

    // Create a temporary message object
    const tempMessage: Message = {
      id: uuid(),
      chatSessionId: currentChat.id,
      content,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI (add user message)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    const creditDeductionPromise = deductCredits(modelData.creditsPerMessage);

    try {
      await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkId: currentChat.userId, content }),
      });

      setIsGeneratingImage(true); // Set loading state

      const eventSource = new EventSource(
        `/api/${modelData.apiEndpoint}/${currentChat.id}/image/stream?content=${encodeURIComponent(content)}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setIsGeneratingImage(false); // Clear loading state

        // Append AI response without removing user message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuid(),
            chatSessionId: currentChat.id,
            content: data.imageUrl,
            role: 'assistant',
            createdAt: new Date().toISOString(),
          },
        ]);

        eventSource.close();
      };

      eventSource.onerror = () => {
        setIsGeneratingImage(false); // Clear loading state on error
        console.error('SSE Error');
        eventSource.close();
      };

      await creditDeductionPromise;
    } catch (error) {
      setIsGeneratingImage(false); // Clear loading state on error
      console.error('Error sending message:', error);

      // Optionally mark message as failed
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
    }
  };

  return (
    <div className="h-full w-full bg-background/60 backdrop-blur-sm flex flex-col">
      {currentChat ? (
        <>
          <ChatHeader title={currentChat.title} />
          <div className="flex-1 flex flex-col justify-end overflow-hidden">
            <MessagesList
              messages={messages}
              loading={loading}
              error={error}
              isGeneratingImage={isGeneratingImage}
              chatLoaded={chatLoaded}
              ref={messagesEndRef}
            />
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </>
      ) : (
        <EmptyState onCreateNewChat={onCreateNewChat} />
      )}
    </div>
  );
}

function EmptyState({ onCreateNewChat }: { onCreateNewChat: () => void }) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-4">
      <div className="max-w-md w-full rounded-xl bg-card shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare size={28} className="text-primary" />
        </div>

        <h3 className="text-xl font-semibold mb-3">Welcome to Quotica Chat</h3>

        <p className="text-muted-foreground mb-6">
          Chat with our AI to generate beautiful quote images. Start a new conversation to begin
          creating custom images.
        </p>

        <Button
          onClick={onCreateNewChat}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Start New Chat
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
