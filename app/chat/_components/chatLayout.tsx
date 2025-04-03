'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import ChatSidebar from './chatSidebar';
import ChatMainArea from './chatMainArea';
import { ChatSession as Chat } from '../types';

export default function ChatLayout() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle initial loading and session changes from URL
  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchChats(user.id);
    }
  }, [isLoaded, user?.id]);

  // Parse the session ID from the URL and update state (no navigation)
  useEffect(() => {
    const sessionId = pathname.split('/')[2] || null;
    if (sessionId && chats.length > 0) {
      const matchedChat = chats.find((c) => c.id === sessionId);
      if (matchedChat) {
        setCurrentChat(matchedChat);
      }
    }
  }, [pathname, chats]);

  // const fetchChats = async (userId: string) => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`/api/chat?userId=${userId}`);
  //     if (!response.ok) throw new Error("Failed to fetch chats");

  //     const chatData: Chat[] = await response.json();
  //     setChats(chatData);

  //     // After fetching chats, check if there's a chat ID in the URL
  //     const sessionId = pathname.split("/")[2];
  //     if (sessionId) {
  //       const matchedChat = chatData.find((c) => c.id === sessionId);
  //       if (matchedChat) {
  //         setCurrentChat(matchedChat);
  //       } else if (chatData.length > 0) {
  //         // If chat in URL doesn't exist but we have chats, update URL to first chat
  //         updateUrl(chatData[0].id);
  //         setCurrentChat(chatData[0]);
  //       }
  //     } else if (chatData.length > 0) {
  //       // If no chat ID in URL but we have chats, set the first one as current
  //       setCurrentChat(chatData[0]);
  //       updateUrl(chatData[0].id);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching chat sessions:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchChats = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch chats');

      const chatData: Chat[] = await response.json();
      setChats(chatData);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL without page reload
  const updateUrl = (chatId: string) => {
    const url = `/chat/${chatId}`;
    window.history.pushState({}, '', url);
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ userId: user?.id }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to create chat');

      const newChat: Chat = await response.json();

      // Add to chats list without refetching
      setChats((prevChats) => [newChat, ...prevChats]);

      // Set as current chat
      setCurrentChat(newChat);

      // Update URL without page reload
      updateUrl(newChat.id);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to rename chat');

      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
      );

      if (currentChat?.id === chatId) {
        setCurrentChat((prevChat) => (prevChat ? { ...prevChat, title: newTitle } : null));
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      // Update chats list
      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);

      // If deleted the current chat, select another one or clear
      if (currentChat?.id === chatId) {
        if (updatedChats.length > 0) {
          setCurrentChat(updatedChats[0]);
          updateUrl(updatedChats[0].id);
        } else {
          setCurrentChat(null);
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    updateUrl(chat.id); // Update URL without page reload
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-primary/20 h-16 w-16 mb-4"></div>
          <div className="h-4 w-24 bg-primary/20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-66px)] overflow-hidden bg-background/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Chat Layout as a flex container */}
      <div className="flex w-full h-full">
        <ChatSidebar
          chats={chats}
          currentChat={currentChat}
          loading={loading}
          onCreateNewChat={createNewChat}
          onSelectChat={selectChat}
          onRenameChat={renameChat}
          onDeleteChat={deleteChat}
        />

        <div className="flex-1">
          <ChatMainArea currentChat={currentChat} onCreateNewChat={createNewChat} />
        </div>
      </div>
    </div>
  );
}
