'use client';

import React from 'react';
import { Settings, Share, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  title: string;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function ChatHeader({ title, isMobile = false, onMenuClick }: ChatHeaderProps) {
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
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn('text-muted-foreground', isMobile ? 'h-8 w-8' : 'h-9 w-9')}
        >
          <Share className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn('text-muted-foreground', isMobile ? 'h-8 w-8' : 'h-9 w-9')}
            >
              <Settings className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem>Edit chat title</DropdownMenuItem>
            <DropdownMenuItem>Download chat</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete chat</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
