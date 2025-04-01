"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Send, Plus, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";
import ChatMessage from "./_components/ChatMessage";
import { Chat, Message } from "./types";

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const userId = user?.id || "guest";
  const { theme } = useTheme();

  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch chats when component mounts
  useEffect(() => {
    if (userId && userId !== "guest") {
      fetchChats();
    }
  }, [userId]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      // This would be replaced with your actual API endpoint
      // const response = await fetch(`/api/chats?userId=${userId}`);
      // const data = await response.json();
      // For demo purposes, create sample chats
      const sampleChats: Chat[] = [
        {
          id: "1",
          title: "Chat about React",
          messages: [
            {
              id: "msg1",
              role: "user",
              content: "What is React?",
              timestamp: new Date().toISOString(),
            },
            {
              id: "msg2",
              role: "assistant",
              content:
                "React is a JavaScript library for building user interfaces, particularly single-page applications. It's used for handling the view layer and allows you to create reusable UI components.",
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Chat about Next.js",
          messages: [
            {
              id: "msg3",
              role: "user",
              content: "Tell me about Next.js",
              timestamp: new Date().toISOString(),
            },
            {
              id: "msg4",
              role: "assistant",
              content:
                "Next.js is a React framework that enables server-side rendering, static site generation, and other performance optimizations. It simplifies the development of React applications.",
              timestamp: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setChats(sampleChats);
      setCurrentChat(sampleChats[0]); // Set the first chat as current
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: `new-${Date.now()}`,
      title: "New Chat",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
  };

  const selectChat = (chat: Chat) => {
    setCurrentChat(chat);
  };

  const sendMessage = async () => {
    if (!message.trim() || !currentChat) return;

    // Create a copy of the current chat to update
    const updatedChat = { ...currentChat };

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    updatedChat.messages = [...updatedChat.messages, userMessage];
    updatedChat.updatedAt = new Date().toISOString();

    // Update the title if this is the first message
    if (updatedChat.messages.length === 1) {
      updatedChat.title =
        message.substring(0, 30) + (message.length > 30 ? "..." : "");
    }

    // Update the current chat immediately with the user message
    setCurrentChat(updatedChat);

    // Update the chats list with the updated chat
    const updatedChats = chats.map((chat) =>
      chat.id === updatedChat.id ? updatedChat : chat
    );
    setChats(updatedChats);

    // Clear the input
    setMessage("");

    // Simulate API call and bot response
    setTimeout(() => {
      // Add assistant's response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `This is a sample response to: "${message}"`,
        timestamp: new Date().toISOString(),
      };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date().toISOString(),
      };

      // Update current chat with assistant message
      setCurrentChat(finalChat);

      // Update chats list
      const finalChats = chats.map((chat) =>
        chat.id === finalChat.id ? finalChat : chat
      );
      setChats(finalChats);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
      {/* Sidebar */}
      <div
        className={`w-64 border-r overflow-y-auto h-full ${
          theme === "dark"
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={createNewChat}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg ${
              theme === "dark"
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="px-2">
          <h2
            className={`px-2 mb-2 text-sm font-medium ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Recent Chats
          </h2>
          {loading ? (
            <div
              className={`p-4 text-center ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Loading chats...
            </div>
          ) : chats.length === 0 ? (
            <div
              className={`p-2 text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No chats yet. Start a new conversation!
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => selectChat(chat)}
                  className={`p-2 rounded-lg cursor-pointer flex items-center gap-2 text-sm ${
                    currentChat?.id === chat.id
                      ? theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-900"
                      : theme === "dark"
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <MessageSquare size={16} />
                  <div className="truncate">{chat.title}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div
              className={`p-4 border-b ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } sticky top-0 z-10 bg-inherit`}
            >
              <h2 className="font-medium">{currentChat.title}</h2>
            </div>

            {/* Messages List - Only allow this container to scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-2 max-h-[calc(100vh-132px)]">
              {currentChat.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center max-w-md">
                    <MessageSquare
                      size={40}
                      className="mx-auto mb-4 opacity-30"
                    />
                    <h3 className="text-xl font-medium mb-2">
                      Start a new conversation
                    </h3>
                    <p
                      className={`text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Type a message below to start chatting with the assistant.
                    </p>
                  </div>
                </div>
              ) : (
                currentChat.messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              )}
            </div>

            {/* Message Input */}
            <div
              className={`p-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              } sticky bottom-0 z-10 bg-inherit`}
            >
              <div className="flex items-end rounded-lg gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Quotify..."
                    rows={1}
                    className={`w-full p-3 rounded-lg resize-none ${
                      theme === "dark"
                        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                        : "bg-white border border-gray-300 focus:border-blue-400"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className={`p-3 rounded-lg ${
                    !message.trim()
                      ? theme === "dark"
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : theme === "dark"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center overflow-hidden">
            <div className="text-center max-w-md p-8">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-medium mb-2">
                Welcome to Quotify Chat
              </h3>
              <p
                className={`mb-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Start a new chat or select an existing chat from the sidebar.
              </p>
              <button
                onClick={createNewChat}
                className={`px-4 py-2 rounded-lg ${
                  theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
