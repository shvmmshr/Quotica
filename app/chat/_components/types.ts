export interface Message {
  id: string;
  chatSessionId: string;
  role: 'user' | 'assistant';
  content?: string;
  imageUrl?: string;
  promt?: string;
  createdAt: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  images: ImageGeneration[];
  createdAt: string;
}

export interface ImageGeneration {
  id: string;
  chatSessionId: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
}
