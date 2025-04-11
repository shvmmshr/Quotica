'use client';
import { useEffect, useState, useRef } from 'react';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatHeader from './chatHeader';
import MessagesList from './messagesList';
import MessageInput from './messageInput';
import { ChatSession as Chat, Message } from '../types';
import { v4 as uuid } from 'uuid';
import { modelOptions } from '@/lib/models';
import { useCredits } from '@/app/context/creditsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ChatMainAreaProps {
  currentChat: Chat | null;
  onCreateNewChat: () => void;
  isMobile?: boolean;
  onToggleSidebar?: () => void;
}

export default function ChatMainArea({
  currentChat,
  onCreateNewChat,
  isMobile = false,
  onToggleSidebar,
}: ChatMainAreaProps) {
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

  const handleSendMessage = async (content: string, selectedOptionId: string) => {
    if (!content.trim() || !currentChat) return;

    // Find the selected option from all model options
    console.log('Selected Option ID:', selectedOptionId);
    const selectedOption =
      Object.values(modelOptions)
        .flat()
        .find((option) => option.id === selectedOptionId) || modelOptions.bot[0];

    console.log('Selected Option:', selectedOption);

    // Create a temporary message object
    const tempMessage: Message = {
      id: uuid(),
      chatSessionId: currentChat.id,
      content: content,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI (add user message)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      // Send to chat API with model options
      await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: currentChat.userId,
          content,
        }),
      });

      setIsGeneratingImage(true); // Set loading state

      // Construct API endpoint with all necessary parameters
      const endpoint =
        `/api/${
          selectedOption.id.includes('gemini')
            ? 'gemini'
            : selectedOption.id.includes('dalle')
              ? 'dalle'
              : 'bot'
        }/${currentChat.id}/image/stream?content=${encodeURIComponent(content)}` +
        `&model=${encodeURIComponent(selectedOption.name)}` +
        `&quality=${selectedOption.quality || 'standard'}` +
        `&size=${selectedOption.size || '1024x1024'}`;

      const eventSource = new EventSource(endpoint);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setIsGeneratingImage(false); // Clear loading state

        // Append AI response without removing user message
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuid(),
            chatSessionId: currentChat.id,
            imageUrl: data.imageUrl,
            promt: content,
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
      try {
        await deductCredits(selectedOption.credits);
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }
    } catch (error) {
      setIsGeneratingImage(false); // Clear loading state on error
      console.error('Error sending message:', error);

      // Optionally mark message as failed
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
    }
  };

  const handleSendImage = async (imageBase64: string, prompt: string, selectedOptionId: string) => {
    if (!imageBase64 || !currentChat) return;

    // Find the selected option from all model options
    const selectedOption =
      Object.values(modelOptions)
        .flat()
        .find((option) => option.id === selectedOptionId) || modelOptions.bot[0];

    // Create a temporary message object for the image
    const tempMessage: Message = {
      id: uuid(),
      chatSessionId: currentChat.id,
      imageUrl: imageBase64, // Temporary base64 URL for preview
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI (add user message with image)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      setIsGeneratingImage(true);

      // 1. First upload the original image to ImageKit
      const fileName = `upload_${uuid()}.png`;
      const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageBase64,
          fileName,
          sessionId: currentChat.id,
        }),
      });

      if (!uploadResponse.ok) throw new Error('Failed to upload image to ImageKit');
      const { url: imageKitUrl } = await uploadResponse.json();

      await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: currentChat.userId,
          content: prompt,
          imageUrl: imageKitUrl,
          createdAt: new Date().toISOString(),
        }),
      });

      // 2. Send to GPT-4 Turbo for analysis
      // const gptResponse = await fetch('/api/analyseImage', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     imageUrl: imageKitUrl,
      //     prompt, // Optional user prompt
      //   }),
      // });

      // if (!gptResponse.ok) throw new Error('Failed to analyze image');
      // const { description } = await gptResponse.json();
      const description = 'Generated image description';

      // 3. Combine description with user prompt (if any)
      const combinedPrompt = prompt ? `${description} ${prompt}` : description;

      // 4. Generate new image with DALL-E (backend handles upload)
      const endpoint =
        `/api/${selectedOption.id.includes('dalle') ? 'dalle' : 'bot'}/${currentChat.id}/image/stream?content=${encodeURIComponent(combinedPrompt)}` +
        `&model=${encodeURIComponent(selectedOption.name)}` +
        `&quality=${selectedOption.quality || 'standard'}` +
        `&size=${selectedOption.size || '1024x1024'}`;

      const eventSource = new EventSource(endpoint);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setIsGeneratingImage(false);

        // Backend now returns the final ImageKit URL directly
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuid(),
            chatSessionId: currentChat.id,
            imageUrl: data.imageUrl, // Final ImageKit URL from backend
            promt: combinedPrompt, // Store the prompt used for generation
            role: 'assistant',
            createdAt: new Date().toISOString(),
          },
        ]);

        // Backend also handles storing in ImageGeneration collection
        eventSource.close();
      };

      eventSource.onerror = () => {
        setIsGeneratingImage(false);
        console.error('SSE Error');
        eventSource.close();
      };

      try {
        await deductCredits(selectedOption.credits);
      } catch (creditError) {
        console.error('Failed to deduct credits:', creditError);
      }
    } catch (error) {
      setIsGeneratingImage(false);
      console.error('Error processing image:', error);

      // Mark message as failed
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
    }
  };

  const handleSendImageGemini = async (
    imageBase64: string,
    prompt: string,
    selectedOptionId: string,
    imagefileType: string
  ) => {
    if (!currentChat) return;

    const selectedOption =
      Object.values(modelOptions)
        .flat()
        .find((option) => option.id === selectedOptionId) || modelOptions.gemini?.[0];

    const tempMessage: Message = {
      id: uuid(),
      chatSessionId: currentChat.id,
      imageUrl: imageBase64 || undefined,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setIsGeneratingImage(true);

    try {
      let imageKitUrl = '';
      if (imageBase64 !== '') {
        const fileName = `upload_${uuid()}.png`;
        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: imageBase64,
            fileName,
            sessionId: currentChat.id,
          }),
        });
        if (!uploadResponse.ok) throw new Error('Failed to upload image to ImageKit');
        const resp = await uploadResponse.json();
        imageKitUrl = resp.url;
      }

      await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: currentChat.userId,
          content: prompt,
          imageUrl: imageKitUrl,
          role: 'user',
        }),
      });
      const response = await fetch(`/api/gemini/${currentChat.id}/image/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64 || '',
          imagefileType,
          content: prompt,
          model: selectedOption.name,
        }),
      });

      const result = await response.json();

      setIsGeneratingImage(false);

      if (result.error) {
        throw new Error(result.error);
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid(),
          chatSessionId: currentChat.id,
          imageUrl: result.imageUrl || undefined,
          promt: prompt,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        },
      ]);

      await deductCredits(selectedOption.credits);
    } catch (error) {
      setIsGeneratingImage(false);
      console.error('Error processing image with Gemini:', error);

      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
    }
  };

  return (
    <div className="h-full w-full bg-background/60 backdrop-blur-sm flex flex-col">
      {currentChat ? (
        <>
          <ChatHeader title={currentChat.title} isMobile={isMobile} onMenuClick={onToggleSidebar} />
          <div className="flex-1 flex flex-col justify-end overflow-hidden relative px-1 sm:px-3">
            {/* Background gradients */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full opacity-60 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-purple-600/5 blur-3xl rounded-full opacity-60 pointer-events-none" />

            <MessagesList
              messages={messages}
              loading={loading}
              error={error}
              isGeneratingImage={isGeneratingImage}
              chatLoaded={chatLoaded}
              isMobile={isMobile}
              ref={messagesEndRef}
            />
          </div>
          <div className="p-2 sm:p-4">
            <MessageInput
              onSendMessage={handleSendMessage}
              onSendImage={handleSendImage}
              isMobile={isMobile}
              onSendImageGemini={handleSendImageGemini}
            />
          </div>
        </>
      ) : (
        <EmptyState onCreateNewChat={onCreateNewChat} isMobile={isMobile} />
      )}
    </div>
  );
}

interface EmptyStateProps {
  onCreateNewChat: () => void;
  isMobile?: boolean;
}

function EmptyState({ onCreateNewChat, isMobile }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden p-4 relative">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/5 blur-3xl rounded-full opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 bg-purple-600/5 blur-3xl rounded-full opacity-70 pointer-events-none" />

      <Card className={`${isMobile ? 'max-w-full w-full' : 'max-w-md w-full'}`}>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageSquare size={28} className="text-primary" />
          </div>
          <CardTitle className="text-xl">Welcome to Quotica Chat</CardTitle>
          <CardDescription>
            Chat with our AI to generate beautiful quote images. Start a new conversation to begin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div
            className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-4'} w-full mb-6`}
          >
            <div className="bg-card border rounded-lg p-4 text-center">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-sm font-medium mb-1">AI-Powered</h3>
              <p className="text-xs text-muted-foreground">Advanced image generation</p>
            </div>
            <div className="bg-card border rounded-lg p-4 text-center">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-sm font-medium mb-1">Chat Interface</h3>
              <p className="text-xs text-muted-foreground">Easy and intuitive</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={onCreateNewChat}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Start New Chat
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
