'use client';

import React from 'react';
import { Menu, Pencil } from 'lucide-react';
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
    <header className="flex items-center justify-between border-b border-border/40 px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2">
        {isMobile && onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground mr-1"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        )}
        <h2
          className={cn(
            'font-semibold truncate max-w-[200px] sm:max-w-none',
            isMobile ? 'text-lg' : 'text-xl'
          )}
        >
          {title}
        </h2>
        {onRename && (
          <Button
            onClick={onRename}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
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
