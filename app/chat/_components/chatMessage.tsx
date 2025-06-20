'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message } from '../types';
import { toast } from 'sonner';
interface ChatMessageProps {
  message: Message;
  isMobile?: boolean;
}

export default function ChatMessage({ message, isMobile = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const hasError = message.error;
  const hasImage = !!message.imageUrl;
  const hasContent = !!message.content;
  const hasPrompt = !!message.content;

  const [imageLoading, setImageLoading] = useState(hasImage);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy prompt:', error);
    }
  };

  const handleDownloadImage = async () => {
    if (!message.imageUrl) return;

    try {
      const response = await fetch(message.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quotica-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div className="w-full">
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
            'rounded-[16] px-3 py-3',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
            hasError && 'bg-destructive/10 text-destructive dark:text-red-300'
          )}
        >
          <div className={cn('whitespace-pre-wrap break-words', isMobile ? 'text-sm' : 'text-lg')}>
            {/* Show prompt if available (for user messages) */}

            {/* Image display */}
            {hasImage && (
              <div className="relative">
                {imageLoading && (
                  <div className="flex justify-center items-center w-full h-32 sm:h-40">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-4 border-gray-300 border-t-primary"></div>
                  </div>
                )}

                {!imageError && (
                  <img
                    src={message.imageUrl!}
                    alt={message.promt || 'Generated image'}
                    className={cn(
                      'rounded-lg w-full max-h-[400px] object-contain',
                      imageLoading ? 'hidden' : 'block'
                    )}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                  />
                )}

                {imageError && (
                  <div className="text-center p-4 text-red-500">Failed to load image</div>
                )}
              </div>
            )}

            {/* Text content */}
            {hasContent && <div className={hasImage ? 'mt-2' : ''}>{message.content}</div>}

            {/* Error message */}
            {hasError && (
              <div className="mt-2 text-xs font-medium">
                Error sending message. Please try again.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download button for system-generated images - outside bubble */}
      {hasImage && !isUser && !imageLoading && !imageError && (
        <div
          className="flex gap-2 mt-2 justify-start"
          style={{
            paddingLeft: isMobile ? '2%' : '20%',
            paddingRight: isMobile ? '2%' : '20%',
          }}
        >
          <button
            onClick={handleDownloadImage}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-accent border border-border rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Download className="h-3 w-3" />
            Download Image
          </button>
        </div>
      )}

      {/* Copy prompt button for user messages - outside bubble on the right */}
      {hasPrompt && isUser && (
        <div
          className="flex gap-2 mt-2 justify-end"
          style={{
            paddingLeft: isMobile ? '2%' : '20%',
            paddingRight: isMobile ? '2%' : '20%',
          }}
        >
          <button
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-background hover:bg-accent border border-border rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy Prompt
              </>
            )}
          </button>
        </div>
      )}

      {/* Debug: Show what values we have
      {isUser && (
        <div
          className="text-xs text-gray-500 mt-1"
          style={{ paddingLeft: isMobile ? '2%' : '20%', paddingRight: isMobile ? '2%' : '20%' }}
        >
          Debug: hasPrompt={hasPrompt.toString()}, promt="{message.promt}", role={message.role}
        </div>
      )} */}
    </div>
  );
}
