'use client';

import { useState } from 'react';
import { Plus, MessageSquare, Pencil, Trash, Loader2, Search, MoreHorizontal } from 'lucide-react';
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

interface ChatSidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chat: Chat) => Promise<void>;
}

export default function ChatSidebar({
  chats,
  currentChat,
  loading,
  onCreateNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
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

  const filteredChats = searchQuery
    ? chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : chats;

  return (
    <div className="w-90 border-r border-border/30 h-full bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <h2 className="text-xl font-semibold">Chat History</h2>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* New Chat Button */}
          <div className="px-4 py-2">
            <Button
              onClick={onCreateNewChat}
              className="w-full text-primary-foreground bg-primary hover:bg-primary/90 gap-2"
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
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-primary" size={24} />
                <span className="mt-2 text-sm text-muted-foreground">Loading chats...</span>
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
                  className={`group rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors
                    ${currentChat?.id === chat.id ? 'bg-accent/80' : 'bg-background'}
                  `}
                >
                  <div
                    className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                    onClick={() => onSelectChat(chat)}
                  >
                    <span className="truncate text-[16px] px-2 py-2">{chat.title}</span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-muted"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={24} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[200px] text-lg">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick(chat);
                          }}
                          className="flex items-center gap-2"
                        >
                          <Pencil size={16} />
                          Rename Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(chat);
                          }}
                          className="flex items-center gap-2 text-destructive"
                        >
                          <Trash size={16} />
                          Delete Chat
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
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
