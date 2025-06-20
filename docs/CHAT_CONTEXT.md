# Chat Context System Documentation

## Overview

The chat context system provides intelligent conversation history management for Quotica's AI-powered chat functionality. It enables the AI models to maintain context across conversations, providing more relevant and coherent responses based on previous interactions.

## Features

### 1. Automatic Context Management

- **Word Limit**: Configurable word limit (default: 10,000 words) to prevent context overflow
- **Message Limit**: Maximum number of messages to consider for context
- **Intelligent Selection**: Automatically selects the most relevant messages based on current request

### 2. Intelligent Context Selection

- **Keyword Matching**: Analyzes message content to find contextually relevant previous messages
- **Recency Weighting**: Prioritizes recent messages while maintaining relevance
- **Conversation Flow**: Maintains natural conversation flow by including recent messages

### 3. Multi-Model Support

- **OpenAI GPT-4**: Full conversation history with system prompts
- **Google Gemini**: Context-aware image generation with conversation history
- **DALL-E**: Enhanced prompts with conversation context for image generation

## Configuration

### Chat Configuration (`lib/config/chat.ts`)

```typescript
export const chatConfig = {
  context: {
    maxWords: 10000, // Maximum words in context
    maxMessages: 50, // Maximum messages to consider
    useRelevantContext: true, // Use intelligent context selection
    includeImageContext: true, // Include image generation context
    systemPrompts: {
      // Specialized prompts for each AI model
    },
  },
  // ... other configuration options
};
```

### Context Settings

- `maxWords`: Maximum total words to include in context (default: 10,000)
- `maxMessages`: Maximum number of messages to consider (default: 50)
- `useRelevantContext`: Enable intelligent context selection (default: true)
- `includeImageContext`: Include information about previously generated images (default: true)

## How It Works

### 1. Context Retrieval

When a new message is sent, the system:

1. Fetches recent messages from the database
2. Analyzes the current message for keywords
3. Scores previous messages based on relevance
4. Selects the most relevant messages within the word limit

### 2. Relevance Scoring

Messages are scored based on:

- **Keyword Overlap**: Similarity between message keywords and current request
- **Recency**: More recent messages get higher priority
- **Conversation Flow**: Sequential messages maintain context flow

### 3. Context Formatting

Context is formatted differently for each AI model:

- **OpenAI**: Structured message array with role-based formatting
- **Gemini**: Concatenated string with conversation history
- **DALL-E**: Enhanced prompts with relevant context

## API Integration

### Bot API (`/api/bot/[sessionId]/image`)

```typescript
// Get intelligent context
const contextMessages = chatConfig.context.useRelevantContext
  ? await getRelevantChatContext(sessionId, content, chatConfig.context.maxWords)
  : await getChatContext(sessionId, chatConfig.context.maxWords);

// Format for OpenAI
const messagesWithContext = formatContextForOpenAI(contextMessages, systemPrompt);
```

### Gemini API (`/api/gemini/[sessionId]/image`)

```typescript
// Get context and format for Gemini
const contextString = formatContextForGemini(contextMessages, systemPrompt);
const enhancedContent = contextString + content;
```

### DALL-E API (`/api/gptImage/[sessionId]/image`)

```typescript
// Create enhanced prompt with context
const enhancedPrompt = `${systemPrompt}\n\nContext: ${recentContext}\n\nRequest: ${content}`;
```

## Context Functions

### `getChatContext(sessionId, maxWords)`

Retrieves recent messages up to the specified word limit.

### `getRelevantChatContext(sessionId, currentMessage, maxWords)`

Intelligently selects relevant messages based on keyword matching and recency.

### `formatContextForOpenAI(contextMessages, systemPrompt)`

Formats context messages for OpenAI's chat completion API.

### `formatContextForGemini(contextMessages, systemPrompt)`

Formats context messages as a string for Google Gemini API.

## Benefits

### 1. Improved Response Quality

- AI models understand conversation history
- Responses build upon previous interactions
- Maintains consistency across the conversation

### 2. Personalized Experience

- Learns user preferences over time
- Adapts to user's communication style
- Provides contextually relevant suggestions

### 3. Efficient Context Management

- Respects API token limits
- Prioritizes relevant information
- Maintains conversation flow

### 4. Scalable Architecture

- Configurable limits and settings
- Easy to extend for new AI models
- Optimized database queries

## Usage Examples

### Basic Text Generation

```typescript
// User: "Create a motivational quote about success"
// System includes context from previous quotes about success
// AI generates: "Building on your previous success themes..."
```

### Image Generation with Context

```typescript
// User: "Make this quote more colorful"
// System includes context about previous image styles
// AI generates image with consistent color preferences
```

### Conversation Continuity

```typescript
// User: "Can you make another one like the last one?"
// System finds the most recent relevant generation
// AI creates similar content based on context
```

## Performance Considerations

### Database Optimization

- Indexed queries on `chatSessionId` and `createdAt`
- Efficient pagination with `LIMIT` and `ORDER BY`
- Selective field retrieval to minimize data transfer

### Memory Management

- Word limits prevent excessive context
- Intelligent selection reduces irrelevant data
- Configurable limits for different use cases

### API Efficiency

- Reduced redundant requests
- Optimized prompt construction
- Balanced context vs. performance

## Future Enhancements

### 1. Semantic Search

- Vector embeddings for better context matching
- Semantic similarity scoring
- Cross-conversation context sharing

### 2. User Preferences

- Persistent style preferences
- Theme-based context selection
- Personalized system prompts

### 3. Advanced Analytics

- Context effectiveness metrics
- Response quality tracking
- User satisfaction correlation

## Troubleshooting

### Common Issues

1. **Context Too Long**: Reduce `maxWords` or `maxMessages` in configuration
2. **Poor Relevance**: Adjust keyword matching algorithm or recency weighting
3. **Missing Context**: Check database queries and message retrieval
4. **API Errors**: Verify context formatting for specific AI models

### Debugging

Enable debug logging by setting environment variable:

```bash
DEBUG_CHAT_CONTEXT=true
```

This will log:

- Context retrieval statistics
- Relevance scoring details
- API request/response sizes
- Performance metrics

## Configuration Examples

### High-Context Mode (Detailed Conversations)

```typescript
const highContextConfig = {
  maxWords: 15000,
  maxMessages: 100,
  useRelevantContext: true,
  recencyWeight: 0.2,
};
```

### Lightweight Mode (Fast Responses)

```typescript
const lightweightConfig = {
  maxWords: 5000,
  maxMessages: 20,
  useRelevantContext: false,
  recencyWeight: 0.5,
};
```

### Creative Mode (Image Generation)

```typescript
const creativeConfig = {
  maxWords: 8000,
  maxMessages: 30,
  useRelevantContext: true,
  includeImageContext: true,
  recencyWeight: 0.4,
};
```
