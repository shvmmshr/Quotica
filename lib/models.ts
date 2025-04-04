// lib/models.ts
export const models = {
  bot: {
    name: 'Bot',
    apiEndpoint: 'bot',
    description: 'Chatbot for general conversations',
    creditsPerMessage: 0, // 1 credit per message
  },
  dalle2: {
    name: 'DALL·E 2',
    apiEndpoint: 'dalle2',
    description: 'Generate images using DALL·E 2',
    creditsPerMessage: 50000, // 5 credits per image
  },
  dalle3: {
    name: 'DALL·E 3',
    apiEndpoint: 'dalle3',
    description: 'Generate images using DALL·E 3',
    creditsPerMessage: 10000, // 10 credits per image
  },
};

export const DEFAULT_MODEL = 'bot';
