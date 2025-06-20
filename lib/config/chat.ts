export const chatConfig = {
  // Context settings
  context: {
    maxWords: 10000, // Maximum words to include in context
    maxMessages: 50, // Maximum messages to consider for context
    useRelevantContext: true, // Use intelligent context selection
    includeImageContext: true, // Include information about previous images
    systemPrompts: {
      bot: 'You are a helpful image generator assistant capable of creating a wide variety of images. Use the conversation history to provide contextually relevant responses that align with the user’s intent and preferences.',
      gemini:
        "You are a helpful image generator assistant skilled in producing diverse types of images based on user prompts. Use the conversation history to ensure consistency with the user's style, preferences, and previous requests.",
      gptImage:
        "You are an AI assistant specialized in generating a broad range of images. Analyze the conversation history to understand the user's intent, visual style, and preferences to deliver consistent and contextually appropriate images.",
    },
  },

  // Response settings
  response: {
    maxTokens: 500, // Maximum tokens for text responses
    temperature: 0.7, // Creativity level (0.0 to 1.0)
  },

  // Image generation settings
  image: {
    defaultSize: '1024x1024',
    defaultQuality: 'standard',
    supportedSizes: ['1024x1024', '1024x1536', '1536x1024'],
    supportedQualities: ['standard', 'hd'],
  },

  // Context optimization
  optimization: {
    prioritizeRecent: true, // Give more weight to recent messages
    keywordMatching: true, // Use keyword matching for relevance
    maxRelevantMessages: 20, // Maximum relevant messages to include
    recencyWeight: 0.3, // Weight for recency in relevance scoring
  },
} as const;

export type ChatConfig = typeof chatConfig;
