'use client';

import React from 'react';
import { Pencil, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  title: string;
  isMobile?: boolean;
  onMenuClick?: () => void;
  onRename?: () => void;
}

export default function ChatHeader({
  title,
  isMobile = false,
  onMenuClick,
  onRename,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between border-b border-border/40 px-3 sm:px-4 py-2 sm:py-3 bg-background/80 backdrop-blur-sm',
        isMobile ? 'sticky top-0 z-10' : ''
      )}
    >
      <div className="flex items-center gap-2 w-full">
        {isMobile && onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground shrink-0"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        )}
        <h2
          className={cn(
            'font-semibold truncate flex-1',
            isMobile ? 'text-lg max-w-[calc(100vw-120px)]' : 'text-xl max-w-none'
          )}
        >
          {title}
        </h2>
        {onRename && (
          <Button
            onClick={onRename}
            variant="ghost"
            size="icon"
            className={cn('text-muted-foreground shrink-0', isMobile ? 'h-8 w-8' : 'h-8 w-8')}
          >
            <Pencil className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
            <span className="sr-only">Edit chat title</span>
          </Button>
        )}
      </div>

      {/* right side empty or additional icons if needed */}
    </header>
  );
}
