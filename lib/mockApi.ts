"use client";

import { Chat, Message, UserCredits, ImageModelOption } from "@/app/chat/types";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for our mock data
const chats: Record<string, Chat> = {};
const userCredits: Record<string, UserCredits> = {};

// Sample placeholder images for different models
const sampleImages = {
  "dalle3-hd":
    "https://placehold.co/1024x576/2563eb/FFFFFF?text=DALLE-3+HD+Image",
  "dalle3-standard":
    "https://placehold.co/512x512/3b82f6/FFFFFF?text=DALLE-3+Standard+Image",
  "dalle2-best":
    "https://placehold.co/512x512/60a5fa/FFFFFF?text=DALLE-2+Best+Image",
  "dalle2-better":
    "https://placehold.co/256x256/93c5fd/FFFFFF?text=DALLE-2+Better+Image",
};

// Initialize user credits (in a real app, this would come from a database)
export const initUserCredits = (
  userId: string,
  initialCredits: number = 10
): UserCredits => {
  if (!userCredits[userId]) {
    userCredits[userId] = {
      total: initialCredits,
      used: 0,
    };
  }
  return userCredits[userId];
};

// Get user credits
export const getUserCredits = (userId: string): UserCredits => {
  if (!userCredits[userId]) {
    return initUserCredits(userId);
  }
  return userCredits[userId];
};

// Update user credits
export const updateUserCredits = (
  userId: string,
  delta: number
): UserCredits => {
  if (!userCredits[userId]) {
    initUserCredits(userId);
  }

  userCredits[userId].used += delta;
  return userCredits[userId];
};

// Create a new chat
export const createChat = (userId: string): Chat => {
  const chatId = uuidv4();
  const now = new Date().toISOString();

  const newChat: Chat = {
    id: chatId,
    title: "New Chat",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };

  chats[chatId] = newChat;
  return newChat;
};

// Get all chats for a user
export const getUserChats = (userId: string): Chat[] => {
  return Object.values(chats).filter((chat) => {
    // In a real app, we'd filter by userId in the database
    // Here we're just returning all chats for simplicity
    return true;
  });
};

// Get a specific chat
export const getChat = (chatId: string): Chat | null => {
  return chats[chatId] || null;
};

// Add a message to a chat
export const addMessage = (
  chatId: string,
  message: Omit<Message, "id" | "timestamp">
): Message => {
  if (!chats[chatId]) {
    throw new Error(`Chat with ID ${chatId} not found`);
  }

  const now = new Date().toISOString();
  const newMessage: Message = {
    id: uuidv4(),
    ...message,
    timestamp: now,
  };

  chats[chatId].messages.push(newMessage);
  chats[chatId].updatedAt = now;

  // Update chat title based on first user message if it's still "New Chat"
  if (chats[chatId].title === "New Chat" && message.role === "user") {
    chats[chatId].title =
      message.content.slice(0, 30) + (message.content.length > 30 ? "..." : "");
  }

  return newMessage;
};

// Generate AI response
export const generateResponse = async (
  chatId: string,
  userId: string
): Promise<Message> => {
  if (!chats[chatId]) {
    throw new Error(`Chat with ID ${chatId} not found`);
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const chat = chats[chatId];
  const lastMessage = chat.messages[chat.messages.length - 1];

  // Generate a response based on the last message
  let responseContent = "";

  if (
    lastMessage.content.toLowerCase().includes("hello") ||
    lastMessage.content.toLowerCase().includes("hi")
  ) {
    responseContent = "Hello! How can I assist you today?";
  } else if (lastMessage.content.toLowerCase().includes("help")) {
    responseContent = "I'd be happy to help. What do you need assistance with?";
  } else if (
    lastMessage.content.toLowerCase().includes("image") ||
    lastMessage.content.toLowerCase().includes("picture")
  ) {
    responseContent =
      "I can generate images for you. Just describe what you'd like to see, and I'll create it!";
  } else {
    responseContent =
      "I understand you're asking about " +
      lastMessage.content.split(" ").slice(0, 3).join(" ") +
      "... Let me think about that. I'd need more context to provide a detailed response.";
  }

  // Create the response message
  return addMessage(chatId, {
    role: "assistant",
    content: responseContent,
  });
};

// Generate an image based on a prompt
export const generateImage = async (
  chatId: string,
  userId: string,
  prompt: string,
  modelOption: ImageModelOption
): Promise<Message | null> => {
  if (!chats[chatId]) {
    throw new Error(`Chat with ID ${chatId} not found`);
  }

  // Check if user has enough credits
  const credits = getUserCredits(userId);
  if (credits.total - credits.used < modelOption.creditCost) {
    return null; // Not enough credits
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Update user credits
  updateUserCredits(userId, modelOption.creditCost);

  // Determine which sample image to use based on model
  let imageUrl = "";
  if (modelOption.version === "DALLE-3") {
    imageUrl =
      modelOption.quality === "hd"
        ? sampleImages["dalle3-hd"]
        : sampleImages["dalle3-standard"];
  } else {
    imageUrl =
      modelOption.quality === "hd"
        ? sampleImages["dalle2-best"]
        : sampleImages["dalle2-better"];
  }

  // If aspect ratio is 1:1, modify the placeholder size
  if (modelOption.aspectRatio === "1:1") {
    imageUrl = imageUrl.replace(/\d+x\d+/, "512x512");
  } else {
    imageUrl = imageUrl.replace(/\d+x\d+/, "1024x576");
  }

  // Add the message with the image
  return addMessage(chatId, {
    role: "assistant",
    content: `Here's your image based on: "${prompt}"`,
    imageUrl,
  });
};
