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
  content?: string;
  imageUrl?: string;
  promt?: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: string;
  error?: boolean; // Optional error flag for failed messages
}

export type ChatRole = 'user' | 'assistant' | 'system';
