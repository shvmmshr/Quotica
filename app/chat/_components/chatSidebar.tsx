'use client';

import { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash,
  Loader2,
  Search,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { ChatSession as Chat } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatSidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chat: Chat) => Promise<void>;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ChatSidebar({
  chats,
  currentChat,
  loading,
  onCreateNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  isMobile = false,
  isOpen = true,
  onClose,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>('');
  const [deleteChat, setDeleteChat] = useState<Chat | null>(null);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  const handleRenameClick = (chat: Chat) => {
    setRenameChatId(chat.id);
    setNewTitle(chat.title);
    setIsRenameDialogOpen(true);
  };

  const handleRenameSubmit = () => {
    if (renameChatId && newTitle.trim() !== '') {
      onRenameChat(renameChatId, newTitle.trim());
      setRenameChatId(null);
      setNewTitle('');
      setIsRenameDialogOpen(false);
    }
  };

  const handleDeleteClick = (chat: Chat) => {
    setDeleteChat(chat);
    setIsDeleteDialogOpen(true);
    setChatToDelete(chat.title);
  };

  const handleDeleteConfirm = async () => {
    if (deleteChat) {
      await onDeleteChat(deleteChat);
      setDeleteChat(null);
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    onSelectChat(chat);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const filteredChats = searchQuery
    ? chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  return (
    <div
      className={cn(
        'bg-background/80 backdrop-blur-sm border-r border-border/30 h-full',
        isMobile
          ? 'fixed top-[66px] bottom-0 left-0 z-40 w-[280px] transition-transform transform duration-300 ease-in-out shadow-xl'
          : 'w-[280px]',
        isMobile && !isOpen && '-translate-x-full',
        isMobile && isOpen && 'translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h2 className="text-xl font-semibold">Chat History</h2>
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
              <X size={18} />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="px-4 py-3">
            <Button
              onClick={onCreateNewChat}
              className="w-full text-primary-foreground bg-primary hover:bg-primary/90 gap-2 shadow-sm"
            >
              <Plus size={16} />
              <span>New Chat</span>
            </Button>
          </div>

          {/* Search Input */}
          <div className="px-4 py-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search chats..."
                className="w-full bg-muted pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Chats List */}
          <ScrollArea className="flex-1 px-2 py-2">
            <div className="space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <Loader2 className="animate-spin text-primary mb-2" size={24} />
                  <span className="text-sm text-muted-foreground">Loading chats...</span>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto mb-2 text-muted-foreground" size={24} />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? 'No matching chats found'
                      : 'No chats yet. Start a new conversation!'}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group rounded-lg transition-colors
                      ${
                        currentChat?.id === chat.id
                          ? 'bg-accent/80 text-accent-foreground'
                          : 'hover:bg-accent/50 hover:text-accent-foreground'
                      }
                    `}
                  >
                    <div
                      className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MessageSquare size={16} className="text-muted-foreground" />
                        <span className="truncate text-sm font-medium">{chat.title}</span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 rounded-full transition-opacity ${
                              isMobile
                                ? 'opacity-100'
                                : 'group-hover:opacity-100 focus:opacity-100 opacity-50'
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal size={16} />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameClick(chat);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Pencil size={14} />
                            Rename Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(chat);
                            }}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash size={14} />
                            Delete Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Rename Dialog */}
      <AlertDialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Chat</AlertDialogTitle>
            <AlertDialogDescription>Enter a new name for your chat.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New chat name"
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameSubmit} disabled={!newTitle.trim()}>
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{chatToDelete}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
