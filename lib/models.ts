// lib/models.ts
export type ModelOption = {
  id: string;
  name: string;
  quality?: 'sd' | 'hd' | 'low' | 'medium' | 'high';
  size?: '1024x1024' | '1024x1792' | '256x256' | '512x512' | '1024x1536' | '1536x1024';
  credits: number;
};

export const modelOptions: Record<string, ModelOption[]> = {
  gptImage: [
    {
      id: 'gptImage-high-1024',
      name: 'GPT Image',
      quality: 'high',
      size: '1024x1024',
      credits: 35,
    },
    {
      id: 'gptImage-high-1024x1536',
      name: 'GPT Image',
      quality: 'high',
      size: '1024x1536',
      credits: 50,
    },
    {
      id: 'gptImage-high-1536x1024',
      name: 'GPT Image',
      quality: 'high',
      size: '1536x1024',
      credits: 50,
    },
  ],
  gemini: [
    {
      id: 'gemini',
      name: 'Gemini',
      credits: 0, // $0.04 -> 1 credit (fixed from 0)
    },
  ],
};

export const DEFAULT_MODEL = 'gemini';

// Original models definition (kept for compatibility)
export const models = {
  gptImage: {
    name: 'GPT Image',
    apiEndpoint: 'gptImage',
    description: 'Generate images using GPT',
    creditsPerMessage: 2,
  },
  gemini: {
    name: 'Gemini',
    apiEndpoint: 'gemini',
    description: 'Generate images using Gemini',
    creditsPerMessage: 1,
  },
};
