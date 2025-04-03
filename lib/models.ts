export const models = {
  bot: {
    name: 'Bot',
    apiEndpoint: 'bot',
    description: 'Chatbot for general conversations',
  },
  dalle2: {
    name: 'DALL·E 2',
    apiEndpoint: 'dalle2',
    description: 'Generate images using DALL·E 2',
  },
  dalle3: {
    name: 'DALL·E 3',
    apiEndpoint: 'dalle3',
    description: 'Generate images using DALL·E 3',
  },
};

// Default model to use if none is selected
export const DEFAULT_MODEL = 'bot';
