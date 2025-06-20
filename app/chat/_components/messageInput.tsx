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
  onSendImage: (
    imageFile: string,
    userPrompt: string,
    model: string,
    imagefileType?: string
  ) => void;
  isMobile?: boolean;
}

export default function MessageInput({
  onSendMessage,
  onSendImage,
  isMobile = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [selectedOption, setSelectedOption] = useState(modelOptions.gemini[0].id);
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
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

    if (imageFile && !message.trim()) {
      toast.error('Please add a prompt to describe what you want me to do with the image.');
      return;
    }

    if (credits < currentOption.credits) {
      toast.error(`Not enough credits! This option requires ${currentOption.credits} credits.`);
      return;
    }

    if (imageFile && imageBase64) {
      setIsProcessing(true);
      try {
        // Use the pre-stored Base64 string - no FileReader needed!
        const base64String = imageBase64;

        // Final validation for base64 string
        if (!base64String || !base64String.includes('base64,')) {
          throw new Error('Invalid image data - please try uploading the image again');
        }
        // Verify the base64 data is not corrupted
        const base64Data = base64String.split(',')[1];
        if (!base64Data || base64Data.length < 100) {
          throw new Error('Image data appears corrupted - please try uploading again');
        }

        const messageText = message;
        const imageType = imageFile.type;
        clearImage();
        setMessage('');

        await onSendImage(base64String, messageText, selectedOption, imageType);

        toast.success('Image processed successfully');
        setIsProcessing(false);

        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } catch (error) {
        console.error('Image processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
        toast.error(`${errorMessage}. Please try uploading the image again.`);
        setIsProcessing(false);
      }
    } else if (imageFile && !imageBase64) {
      // Fallback case - image was selected but Base64 not ready
      toast.error('Image is still processing. Please wait a moment and try again.');
      return;
    } else {
      // Text-only messages
      setMessage('');
      onSendMessage(message, selectedOption);

      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Enhanced validation for mobile devices
    if (!file) {
      toast.error('No file selected');
      return;
    }

    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }

    // Increased size limit for mobile photos (they tend to be larger)
    if (file.size > 15 * 1024 * 1024) {
      // 15MB limit for mobile compatibility
      toast.error('Image size should be less than 15MB');
      return;
    }

    // Enhanced format support for mobile devices
    const supportedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'image/avif',
    ];

    if (!supportedTypes.includes(file.type.toLowerCase())) {
      toast.error('Unsupported image format. Please use JPEG, PNG, WebP, or HEIC.');
      return;
    }

    // Additional mobile-specific checks
    if (isMobile) {
      // Check for very large dimensions that might cause issues
      const img = document.createElement('img');
      img.onload = function () {
        // If image is too large, we'll process it normally but warn the user
        const imgElement = img as HTMLImageElement;
        if (imgElement.width * imgElement.height > 16777216) {
          // 4096x4096 pixels
          toast.error('Image resolution is very high. Processing may take longer on mobile.');
        }
      };

      // Create object URL for dimension checking (won't affect the actual processing)
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      // Clean up object URL after check
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    }

    setImageFile(file);
    // Read and store the Base64 string immediately when file is selected
    // This prevents mobile FileReader issues later in sendMessage

    const reader = new FileReader();

    // Add timeout for mobile devices
    const timeout = setTimeout(() => {
      toast.error('Image processing timeout - file may be too large');
      clearImage(); // Clear if processing fails
    }, 30000); // 30 second timeout

    reader.onload = (event) => {
      clearTimeout(timeout);
      const result = event.target?.result as string;

      if (result && typeof result === 'string') {
        try {
          // Verify the data URL format
          if (!result.startsWith('data:image/')) {
            throw new Error('Invalid image format');
          }

          // Check if base64 data exists
          const base64Part = result.split(',')[1];
          if (!base64Part || base64Part.length === 0) {
            throw new Error('No image data found');
          }

          // Validate base64 encoding
          try {
            atob(base64Part.substring(0, 100)); // Test decode a small portion
          } catch (e) {
            console.error('Base64 decoding error:', e);
            throw new Error('Invalid base64 encoding');
          }

          // Store the Base64 string for later use in sendMessage
          setImageBase64(result);

          // Also set it as preview (same data)
          setImagePreview(result);

          if (isMobile) {
            toast.success('Image loaded successfully');
          }
        } catch (validationError) {
          console.error('Image validation error:', validationError);
          toast.error(
            `Image validation failed: ${validationError instanceof Error ? validationError.message : 'Unknown error'}`
          );
          clearImage();
        }
      } else {
        console.error('No result from FileReader');
        toast.error('Could not read image file');
        clearImage();
      }
    };

    reader.onerror = (error) => {
      clearTimeout(timeout);
      console.error('Error reading image file:', error);
      toast.error('Error reading image file - try a different image');
      clearImage();
    };

    reader.onabort = () => {
      clearTimeout(timeout);
      console.error('Image reading was aborted');
      toast.error('Image reading was cancelled');
      clearImage();
    };

    try {
      reader.readAsDataURL(file);
    } catch (error) {
      clearTimeout(timeout);
      console.error('Failed to start reading file:', error);
      toast.error('Could not read image file');
      clearImage();
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setImageBase64(null);
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
              title="Remove image"
            >
              <XIcon size={14} />
            </button>
            {/* {message && (
              <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">{message}</p>
            )} */}
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
            aria-label="Upload image"
            title="Upload image"
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
              imageFile
                ? isMobile
                  ? 'Describe what to do with the image...'
                  : 'Tell me what to do with the image using a prompt...'
                : isMobile
                  ? 'Type a message or upload an image...'
                  : 'Message Quotica or upload an image...'
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
            title={
              imageFile && !message.trim() ? 'Add a prompt to send with image' : 'Send message'
            }
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            ) : (
              <ArrowUpIcon size={isMobile ? 18 : 24} />
            )}
            <span className="sr-only">{isProcessing ? 'Processing image...' : 'Send message'}</span>
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
