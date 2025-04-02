"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import ChatSidebar from "./chatSidebar";
import ChatMainArea from "./chatMainArea";
import { ChatSession as Chat } from "./types";

export default function ChatLayout() {
  const { user, isLoaded } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isLoaded && user?.id) {
      fetchChats(user.id);
    }
  }, [isLoaded, user?.id]);

  useEffect(() => {
    const sessionId = pathname.split("/")[2] || null;
    if (sessionId) {
      const chat = chats.find((c) => c.id === sessionId);
      setCurrentChat(chat || null);
    }
  }, [pathname, chats]);

  const fetchChats = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chat?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch chats");

      const chatData: Chat[] = await response.json();
      setChats(chatData);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ userId: user?.id }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create chat");

      const newChat: Chat = await response.json();
      setCurrentChat(newChat);
      router.replace(`/chat/${newChat.id}`);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        body: JSON.stringify({ title: newTitle }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to rename chat");

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === chatId ? { ...chat, title: newTitle } : chat
        )
      );

      if (currentChat?.id === chatId) {
        setCurrentChat((prevChat) =>
          prevChat ? { ...prevChat, title: newTitle } : null
        );
      }
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete chat");

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      if (currentChat?.id === chatId) {
        setCurrentChat(null);
        router.replace("/chat");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
    router.replace(`/chat/${chat.id}`);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`flex h-[calc(100vh-66px)] overflow-hidden ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <ChatSidebar
        chats={chats} // Only show in sidebar, don't push to fetched chats
        currentChat={currentChat}
        loading={loading}
        onCreateNewChat={createNewChat}
        onSelectChat={selectChat}
        theme={theme}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
      />

      <ChatMainArea
        currentChat={currentChat}
        onCreateNewChat={createNewChat}
        theme={theme}
      />
    </div>
  );
}
