'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUpIcon, ChevronDownIcon, ImageIcon, XIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { models, modelOptions, DEFAULT_MODEL } from '@/lib/models';
import { useCredits } from '@/app/context/creditsContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (text: string, model: string) => void;
  onSendImage: (imageFile: string, userPrompt: string, model: string) => void;
  onSendImageGemini: (
    imageFile: string,
    userPrompt: string,
    model: string,
    imagefileType: string
  ) => void;
  isMobile?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendImage,
  isMobile = false,
  onSendImageGemini,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedOption, setSelectedOption] = useState(modelOptions.bot[0].id);
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const sendMessage = async () => {
    if (!message.trim() && !imageFile) return;

    if (credits < currentOption.credits) {
      toast.error(`Not enough credits! This option requires ${currentOption.credits} credits.`);
      return;
    }

    if (imageFile) {
      setIsProcessing(true);
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const base64String = event.target?.result as string;
          clearImage();
          if (
            modelOptions[selectedModel as keyof typeof modelOptions].find(
              (opt) => opt.id === selectedOption
            )?.id === 'gemini'
          ) {
            await onSendImageGemini(base64String, message, selectedOption, imageFile.type);
          } else {
            await onSendImage(base64String, message, selectedOption);
          }
          toast.success('Image processed');
          // Clear both image and text input after successful send

          setMessage('');
          setIsProcessing(false);
        };
        reader.onerror = () => {
          toast.error('Failed to read image file');
          setIsProcessing(false);
        };
        reader.readAsDataURL(imageFile);
      } catch (error) {
        toast.error('Failed to process image');
        console.error(error);
        setIsProcessing(false);
      }
    } else {
      if (
        modelOptions[selectedModel as keyof typeof modelOptions].find(
          (opt) => opt.id === selectedOption
        )?.id === 'gemini'
      ) {
        onSendImageGemini('', message, selectedOption, '');
      } else {
        onSendMessage(message, selectedOption);
      }

      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        {/* Image preview */}
        {imagePreview && (
          <div className="relative p-2 bg-card/40 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-border/40">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              {' '}
              {/* Smaller preview */}
              <Image src={imagePreview} alt="Uploaded preview" fill className="object-cover" />
            </div>
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <XIcon size={14} />
            </button>
            {message && (
              <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">{message}</p>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-end gap-2 p-2 sm:p-3 bg-card/40 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-lg border border-border/40">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
            disabled={isProcessing}
          />

          {/* Image upload button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'shrink-0 rounded-full text-muted-foreground hover:text-primary',
              isMobile ? 'h-10 w-10' : 'h-12 w-12'
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
          >
            <ImageIcon size={isMobile ? 18 : 24} />
            <span className="sr-only">Upload image</span>
          </Button>

          {/* Text input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              imageFile ? 'Add a prompt (optional)...' : 'Message Quotica or upload an image...'
            }
            className={cn(
              'overflow-y-auto flex-1 border border-transparent bg-transparent focus-visible:ring-0 focus-visible:outline-none resize-none leading-relaxed',
              isMobile
                ? 'min-h-[45px] max-h-[150px] px-3 py-2 rounded-lg text-sm'
                : 'min-h-[52px] max-h-[200px] px-5 py-3 rounded-xl text-[16px]'
            )}
            style={{ scrollbarWidth: 'thin' }}
            disabled={isProcessing}
          />

          <Button
            onClick={sendMessage}
            disabled={(!message.trim() && !imageFile) || isProcessing}
            size="icon"
            className={cn(
              'shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground',
              isMobile ? 'h-10 w-10' : 'h-12 w-12'
            )}
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <ArrowUpIcon size={isMobile ? 18 : 24} />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Rest of the component remains the same */}
        {/* Model selector and credits info */}
        <div className="flex items-center justify-between px-1">
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={cn(
                'flex items-center gap-1 rounded-md border border-border bg-background hover:bg-accent/50 transition-colors',
                isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm gap-2'
              )}
              disabled={isProcessing}
            >
              {isMobile ? (
                <span>{models[selectedModel as keyof typeof models].name}</span>
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
