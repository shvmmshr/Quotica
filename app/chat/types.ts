export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  chatSessionId: string;
  content: string;
  role: "user" | "assistant" | "system";
  createdAt: string;
  error?: boolean; // Optional error flag for failed messages
}

export type ChatRole = "user" | "assistant" | "system";

export type UserCredits = {
  total: number;
  used: number;
};

export type ImageModelOption = {
  id: string;
  name: string;
  description: string;
  creditCost: number;
  quality: "standard" | "hd";
  aspectRatio: "1:1" | "16:9";
  version: "DALLE-2" | "DALLE-3";
};

export const IMAGE_MODEL_OPTIONS: ImageModelOption[] = [
  {
    id: "dalle3-16-9-hd",
    name: "DALLE-3 HD (16:9)",
    description: "High-definition widescreen images",
    creditCost: 3,
    quality: "hd",
    aspectRatio: "16:9",
    version: "DALLE-3",
  },
  {
    id: "dalle3-1-1-hd",
    name: "DALLE-3 HD (1:1)",
    description: "High-definition square images",
    creditCost: 2,
    quality: "hd",
    aspectRatio: "1:1",
    version: "DALLE-3",
  },
  {
    id: "dalle3-1-1-standard",
    name: "DALLE-3 Standard (1:1)",
    description: "Standard quality square images",
    creditCost: 1,
    quality: "standard",
    aspectRatio: "1:1",
    version: "DALLE-3",
  },
  {
    id: "dalle3-16-9-standard",
    name: "DALLE-3 Standard (16:9)",
    description: "Standard quality widescreen images",
    creditCost: 2,
    quality: "standard",
    aspectRatio: "16:9",
    version: "DALLE-3",
  },
  {
    id: "dalle2-1-1-best",
    name: "DALLE-2 Best (1:1)",
    description: "Best quality square images using older model",
    creditCost: 0.5,
    quality: "hd",
    aspectRatio: "1:1",
    version: "DALLE-2",
  },
  {
    id: "dalle2-1-1-better",
    name: "DALLE-2 Better (1:1)",
    description: "Better quality square images using older model",
    creditCost: 0.25,
    quality: "standard",
    aspectRatio: "1:1",
    version: "DALLE-2",
  },
];
