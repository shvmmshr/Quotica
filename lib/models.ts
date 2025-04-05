// lib/models.ts
export type ModelOption = {
  id: string;
  name: string;
  quality?: 'sd' | 'hd';
  size?: '1024x1024' | '1024x1792' | '256x256' | '512x512';
  credits: number;
};

export const modelOptions: Record<string, ModelOption[]> = {
  bot: [
    {
      id: 'bot',
      name: 'BOT',
      credits: 0,
    },
  ],
  dalle2: [
    {
      id: 'dalle2-256',
      name: 'DALL·E 2',
      size: '256x256',
      credits: 4, // $0.016 -> 0.4 credits (rounded to 4 for integer math)
    },
    {
      id: 'dalle2-512',
      name: 'DALL·E 2',
      size: '512x512',
      credits: 5, // $0.018 -> 0.45 credits
    },
    {
      id: 'dalle2-1024',
      name: 'DALL·E 2',
      size: '1024x1024',
      credits: 5, // $0.02 -> 0.5 credits
    },
  ],
  dalle3: [
    {
      id: 'dalle3-std',
      name: 'DALL·E 3',
      quality: 'sd',
      size: '1024x1024',
      credits: 10, // $0.04 -> 1 credit
    },
    {
      id: 'dalle3-std-1792',
      name: 'DALL·E 3',
      quality: 'sd',
      size: '1024x1792',
      credits: 20, // $0.08 -> 2 credits
    },
    {
      id: 'dalle3-hd',
      name: 'DALL·E 3',
      quality: 'hd',
      size: '1024x1024',
      credits: 20, // $0.08 -> 2 credits
    },
    {
      id: 'dalle3-hd-1792',
      name: 'DALL·E 3',
      quality: 'hd',
      size: '1024x1792',
      credits: 30, // $0.12 -> 3 credits
    },
  ],
};

export const DEFAULT_MODEL = 'bot';

// Original models definition (kept for compatibility)
export const models = {
  bot: {
    name: 'BOT',
    apiEndpoint: 'bot',
    description: 'Chatbot for general conversations',
    creditsPerMessage: 0,
  },
  dalle2: {
    name: 'DALL·E 2',
    apiEndpoint: 'dalle2',
    description: 'Generate images using DALL·E 2',
    creditsPerMessage: 1,
  },
  dalle3: {
    name: 'DALL·E 3',
    apiEndpoint: 'dalle3',
    description: 'Generate images using DALL·E 3',
    creditsPerMessage: 3,
  },
};
