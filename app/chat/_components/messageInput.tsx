'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ChevronDownIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { models, modelOptions, DEFAULT_MODEL } from '@/lib/models';
import { useCredits } from '@/app/context/creditsContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (text: string, model: string) => void;
  isMobile?: boolean;
}

export default function MessageInput({ onSendMessage, isMobile = false }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedOption, setSelectedOption] = useState(modelOptions.bot[0].id);
  const [showOptions, setShowOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { credits } = useCredits();
  const currentOption =
    modelOptions[selectedModel as keyof typeof modelOptions].find(
      (opt) => opt.id === selectedOption
    ) || modelOptions.bot[0];

  // Auto-adjust height
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    const newHeight = Math.min(textareaRef.current.scrollHeight, isMobile ? 150 : 200);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [message, isMobile]);

  const sendMessage = () => {
    if (!message.trim()) return;

    if (credits < currentOption.credits) {
      toast.error(`Not enough credits! This option requires ${currentOption.credits} credits.`);
      return;
    }

    onSendMessage(message, selectedOption);
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    const firstOption = modelOptions[model as keyof typeof modelOptions][0];
    setSelectedOption(firstOption.id);
  };

  return (
    <div className="sticky bottom-0 z-10 bg-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Input area */}
        <div className="flex items-end gap-2 p-2 sm:p-3 bg-card/40 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-border/40">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Quotica..."
            className={cn(
              'overflow-y-auto flex-1 border border-transparent bg-transparent focus-visible:ring-0 focus-visible:outline-none resize-none leading-relaxed',
              isMobile
                ? 'min-h-[45px] max-h-[150px] px-3 py-2 rounded-lg text-sm'
                : 'min-h-[52px] max-h-[200px] px-5 py-3 rounded-xl text-[16px]'
            )}
            style={{ scrollbarWidth: 'thin' }}
          />

          <Button
            onClick={sendMessage}
            disabled={!message.trim()}
            size="icon"
            className={cn(
              'shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground',
              isMobile ? 'h-10 w-10' : 'h-12 w-12'
            )}
          >
            <ArrowUpIcon size={isMobile ? 18 : 24} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Model selector and credits info */}
        <div className="flex items-center justify-between px-1">
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={cn(
                'flex items-center gap-1 rounded-md border border-border bg-background hover:bg-accent/50 transition-colors',
                isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm gap-2'
              )}
            >
              {isMobile ? (
                <span>Model</span>
              ) : (
                <span>{models[selectedModel as keyof typeof models].name}</span>
              )}

              {!isMobile && currentOption.size && (
                <span className="text-xs bg-muted px-2 py-1 rounded">{currentOption.size}</span>
              )}

              {!isMobile && currentOption.quality && (
                <span className="text-xs uppercase">{currentOption.quality}</span>
              )}

              <ChevronDownIcon
                size={isMobile ? 14 : 16}
                className={`transition-transform ${showOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Model options dropdown */}
            {showOptions && (
              <div
                className={cn(
                  'absolute bottom-full left-0 mb-2 bg-card rounded-lg shadow-lg border border-border/40 z-20',
                  isMobile ? 'w-56' : 'w-64'
                )}
              >
                <div className="p-2 space-y-1">
                  {Object.entries(modelOptions).map(([modelKey, options]) => (
                    <div key={modelKey} className="space-y-1">
                      <h3
                        className={cn(
                          'px-3 py-2 font-medium text-muted-foreground',
                          isMobile ? 'text-xs' : 'text-sm'
                        )}
                      >
                        {models[modelKey as keyof typeof models].name}
                      </h3>
                      {options.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => {
                            handleModelChange(modelKey);
                            setSelectedOption(option.id);
                            setShowOptions(false);
                          }}
                          className={cn(
                            'px-3 py-2 rounded-md cursor-pointer flex justify-between items-center',
                            isMobile ? 'text-xs' : 'text-sm',
                            selectedOption === option.id
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-accent/50'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {option.quality && <span className="uppercase">{option.quality}</span>}
                            {option.size && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                                {option.size}
                              </span>
                            )}
                            {!option.quality && !option.size && <span>Default</span>}
                          </div>
                          <span className="font-medium">
                            {option.credits} credit{option.credits !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            {currentOption.credits > 0 ? (
              <span>
                {currentOption.credits} credit{currentOption.credits !== 1 ? 's' : ''}
              </span>
            ) : (
              <span>Free to use</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
