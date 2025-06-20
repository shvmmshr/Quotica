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
import { toast } from 'sonner';
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
    const selectedOption =
      Object.values(modelOptions)
        .flat()
        .find((option) => option.id === selectedOptionId) || modelOptions.bot[0];

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
    setIsGeneratingImage(true); // Set loading state

    try {
      // Send user message to chat API
      await fetch(`/api/chat/${currentChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: currentChat.userId,
          content,
        }),
      });

      // Determine which API endpoint to use based on the model
      const modelType = selectedOption.id.includes('gemini')
        ? 'gemini'
        : selectedOption.id.includes('gptImage')
          ? 'gptImage'
          : 'bot';

      // Send POST request to generate image
      const response = await fetch(`/api/${modelType}/${currentChat.id}/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content,
          model: selectedOption.name,
          quality: selectedOption.quality || 'standard',
          size: selectedOption.size || '1024x1024',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const result = await response.json();
      setIsGeneratingImage(false); // Clear loading state

      // Add AI response to messages
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuid(),
          chatSessionId: currentChat.id,
          imageUrl: result.imageUrl,
          promt: content,
          role: 'assistant',
          createdAt: new Date().toISOString(),
        },
      ]);

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

  const handleSendImage = async (
    imageBase64: string,
    prompt: string,
    selectedOptionId: string,
    imageFileType: string = ''
  ) => {
    if (!currentChat) return;
    if (!imageBase64 && !prompt.trim()) return;

    // Find the selected option from all model options
    const selectedOption =
      Object.values(modelOptions)
        .flat()
        .find((option) => option.id === selectedOptionId) || modelOptions.bot[0];

    // Create a temporary message object for the image/prompt
    const tempMessage: Message = {
      id: uuid(),
      chatSessionId: currentChat.id,
      imageUrl: imageBase64 || undefined,
      content: prompt,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    // Optimistically update UI (add user message)
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setIsGeneratingImage(true);

    try {
      // Handle image upload if an image is present
      let imageKitUrl = '';
      if (imageBase64) {
        const fileName = `upload_${uuid()}.png`;

        // Enhanced error handling for mobile image uploads
        let uploadAttempts = 0;
        const maxAttempts = 3;

        while (uploadAttempts < maxAttempts) {
          try {
            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrl: imageBase64,
                fileName,
                sessionId: currentChat.id,
              }),
            });

            if (!uploadResponse.ok) {
              const errorData = await uploadResponse.json().catch(() => ({}));
              throw new Error(
                errorData.message || `Upload failed with status: ${uploadResponse.status}`
              );
            }

            const { url } = await uploadResponse.json();
            imageKitUrl = url;
            break; // Success, exit retry loop
          } catch (uploadError) {
            uploadAttempts++;
            console.error(`Image upload attempt ${uploadAttempts} failed:`, uploadError);

            if (uploadAttempts >= maxAttempts) {
              throw new Error(
                `Failed to upload image after ${maxAttempts} attempts: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`
              );
            }

            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, 1000 * uploadAttempts));
          }
        }
      }

      // Save the user message to the chat history
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

      // Determine which model to use and call the appropriate API
      const modelType = selectedOption.id.includes('gemini')
        ? 'gemini'
        : selectedOption.id.includes('gptImage')
          ? 'gptImage'
          : 'bot';

      // Construct request body based on model type
      const requestBody = {
        content: prompt,
        model: selectedOption.name,
        quality: selectedOption.quality || 'standard',
        size: selectedOption.size || '1024x1024',
      };

      // Add image data if present - now for both Gemini and GPT Image models
      if (imageBase64 && (modelType === 'gemini' || modelType === 'gptImage')) {
        Object.assign(requestBody, {
          image: imageBase64,
          imagefileType: imageFileType || 'image/png',
        });
      }

      // Determine the endpoint based on whether this is an edit or a generation
      const endpoint =
        imageBase64 && modelType === 'gptImage'
          ? `/api/${modelType}/${currentChat.id}/edit`
          : `/api/${modelType}/${currentChat.id}/image`;

      // Make API request with enhanced timeout handling for mobile
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            endpoint.includes('/edit')
              ? {
                  prompt,
                  imageBase64,
                  quality: selectedOption.quality || 'standard',
                  size: selectedOption.size || '1024x1024',
                }
              : requestBody
          ),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Failed to generate image: ${response.status} ${response.statusText}`
          );
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.error);
        }

        // Success handling continues as before...
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: uuid(),
            chatSessionId: currentChat.id,
            imageUrl: result.imageUrl || undefined,
            content: result.content || undefined,
            promt: prompt,
            role: 'assistant',
            createdAt: new Date().toISOString(),
          },
        ]);
        setIsGeneratingImage(false);

        // Deduct credits for the operation
        await deductCredits(selectedOption.credits);
      } catch (fetchError) {
        clearTimeout(timeoutId);

        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error(
            'Request timed out. Please check your internet connection and try again.'
          );
        }

        throw fetchError;
      }
    } catch (error) {
      console.error('Error processing image:', error);

      // Enhanced error reporting for mobile debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      let userFriendlyMessage = 'Failed to process image. ';

      if (errorMessage.includes('upload')) {
        userFriendlyMessage +=
          'There was an issue uploading your image. Please try again with a smaller image.';
      } else if (errorMessage.includes('timeout')) {
        userFriendlyMessage += 'The request timed out. Please check your connection and try again.';
      } else if (errorMessage.includes('base64') || errorMessage.includes('Invalid image')) {
        userFriendlyMessage +=
          'There was an issue with your image format. Please try a different image.';
      } else if (errorMessage.includes('size') || errorMessage.includes('large')) {
        userFriendlyMessage += 'Your image is too large. Please use a smaller image.';
      } else {
        userFriendlyMessage += 'Please try again or contact support if the problem continues.';
      }

      toast.error(userFriendlyMessage);

      // Mark message as failed
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg.id === tempMessage.id ? { ...msg, error: true } : msg))
      );
      setIsGeneratingImage(false);
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
