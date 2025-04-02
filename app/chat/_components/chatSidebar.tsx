"use client";

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Pencil,
  Trash,
  Loader2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import { ChatSession as Chat } from "../types";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Dialog } from "@headlessui/react";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/blocks/sidebar";

interface ChatSidebarProps {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  onCreateNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => Promise<void>;
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
  const { theme } = useTheme();
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameChatId, setRenameChatId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleRenameClick = (chat: Chat) => {
    setRenameChatId(chat.id);
    setNewTitle(chat.title);
    setIsRenaming(true);
  };

  const handleRenameSubmit = () => {
    if (renameChatId && newTitle && newTitle.trim() !== "") {
      onRenameChat(renameChatId, newTitle.trim());
      setIsRenaming(false);
      setRenameChatId(null);
      setNewTitle("");
    }
  };

  const handleDelete = async (chatId: string) => {
    setDeletingChatId(chatId);
    await onDeleteChat(chatId);
    setDeletingChatId(null);
  };

  // Filter chats based on search query
  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  return (
    <>
      <div className="w-80 border-r border-border/30 h-full bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border/30">
            <h2 className="font-semibold">Chat History</h2>
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
                  <div className="flex flex-col items-center text-center">
                    <Loader2 className="animate-spin text-primary" size={24} />
                    <span className="mt-2 text-sm text-muted-foreground">
                      Loading chats...
                    </span>
                  </div>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare
                    className="mx-auto mb-2 text-muted-foreground"
                    size={24}
                  />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery
                      ? "No matching chats found"
                      : "No chats yet. Start a new conversation!"}
                  </p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors
                      ${
                        currentChat?.id === chat.id
                          ? "bg-accent/80"
                          : "bg-background"
                      }
                    `}
                  >
                    <div
                      className="flex items-center justify-between gap-2 p-3 cursor-pointer"
                      onClick={() => onSelectChat(chat)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <MessageSquare
                          size={18}
                          className="text-primary shrink-0"
                        />
                        <span className="truncate text-sm">{chat.title}</span>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameClick(chat);
                          }}
                          title="Rename Chat"
                        >
                          <Pencil size={14} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(chat.id);
                          }}
                          disabled={deletingChatId === chat.id}
                          title="Delete Chat"
                        >
                          {deletingChatId === chat.id ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : (
                            <Trash size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 text-xs text-muted-foreground border-t border-border/30">
            <p>Generate beautiful quote images with AI</p>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={isRenaming}
        onClose={() => setIsRenaming(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border">
            <Dialog.Title className="text-lg font-medium mb-4">
              Rename Chat
            </Dialog.Title>

            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2 rounded-md border border-input bg-background mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new name"
              autoFocus
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRenaming(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleRenameSubmit}
                disabled={!newTitle.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Rename
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}
