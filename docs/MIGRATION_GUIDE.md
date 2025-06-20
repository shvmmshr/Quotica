# Chat Context Migration Guide

## What Changed

The Quotica chat system has been enhanced with intelligent context management. Here's what's new:

### Before (Original System)

- AI models received only the current message
- No conversation history or context
- Each request was independent
- Limited continuity between messages

### After (Enhanced System)

- AI models receive up to 10,000 words of conversation context
- Intelligent message selection based on relevance
- Contextual responses that build upon previous interactions
- Configurable context management

## New Files Added

### Core Context System

- `lib/utils/chat-context.ts` - Main context management utilities
- `lib/config/chat.ts` - Configuration settings
- `lib/test/chat-context.test.ts` - Testing utilities
- `docs/CHAT_CONTEXT.md` - Comprehensive documentation

## Modified Files

### API Routes Enhanced

All AI model API routes now include context:

1. **Bot API** (`app/api/bot/[sessionId]/image/route.ts`)

   - Added context retrieval and formatting
   - Enhanced system prompts with context awareness

2. **Gemini API** (`app/api/gemini/[sessionId]/image/route.ts`)

   - Integrated conversation context into prompts
   - Improved contextual image generation

3. **GPT Image API** (`app/api/gptImage/[sessionId]/image/route.ts`)

   - Enhanced prompts with conversation history
   - Better style consistency across generations

4. **GPT Image Edit API** (`app/api/gptImage/[sessionId]/edit/route.ts`)
   - Context-aware image editing
   - Maintains consistency with previous edits

## Key Features

### 1. Intelligent Context Selection

```typescript
// Automatically selects relevant messages
const contextMessages = await getRelevantChatContext(sessionId, currentMessage, 10000);
```

### 2. Configurable Limits

```typescript
// Configurable word and message limits
const chatConfig = {
  context: {
    maxWords: 10000,
    maxMessages: 50,
    useRelevantContext: true,
  },
};
```

### 3. Multi-Model Support

- OpenAI GPT-4: Structured conversation history
- Google Gemini: Context-enhanced prompts
- DALL-E: Style-consistent image generation

## Benefits

### For Users

- More coherent conversations
- AI remembers previous requests
- Consistent style and preferences
- Better follow-up responses

### For Developers

- Easy to configure and customize
- Extensible architecture
- Performance optimized
- Comprehensive documentation

## Configuration Options

### Default Settings

```typescript
{
  maxWords: 10000,        // Up to 10k words of context
  maxMessages: 50,        // Consider up to 50 recent messages
  useRelevantContext: true, // Use intelligent selection
  includeImageContext: true // Include image generation history
}
```

### Customization

You can modify `lib/config/chat.ts` to adjust:

- Context word limits
- Message selection algorithms
- System prompts for each AI model
- Performance optimization settings

## Performance Impact

### Database

- Optimized queries with proper indexing
- Selective field retrieval
- Pagination for large conversations

### API Responses

- Intelligent context selection reduces payload
- Configurable limits prevent oversized requests
- Cached context for repeated requests

### Memory Usage

- Word limits prevent memory overflow
- Efficient message processing
- Garbage collection friendly

## Testing

### Manual Testing

1. Start a conversation with multiple messages
2. Reference previous messages in new requests
3. Observe contextual responses from AI
4. Test with different AI models

### Automated Testing

```bash
# Run the test suite
npm run test:context
```

## Rollback Plan

If issues arise, you can disable context by setting:

```typescript
// In lib/config/chat.ts
const chatConfig = {
  context: {
    useRelevantContext: false,
    maxWords: 0,
  },
};
```

## Monitoring

### Key Metrics to Watch

- Response time impact
- Context selection accuracy
- User satisfaction with responses
- API token usage

### Debug Mode

Enable detailed logging:

```bash
DEBUG_CHAT_CONTEXT=true
```

## Future Roadmap

### Planned Enhancements

1. **Semantic Search**: Vector embeddings for better context matching
2. **User Preferences**: Persistent style and theme preferences
3. **Cross-Session Context**: Share context across user sessions
4. **Analytics Dashboard**: Context effectiveness metrics

### Possible Improvements

- Machine learning for context relevance
- Dynamic context window sizing
- Context compression techniques
- Multi-language context support

## Support

### Common Issues

1. **Slow Responses**: Reduce context limits
2. **Irrelevant Context**: Adjust relevance scoring
3. **Memory Issues**: Optimize database queries
4. **API Errors**: Check context formatting

### Getting Help

- Review documentation in `docs/CHAT_CONTEXT.md`
- Check test utilities in `lib/test/chat-context.test.ts`
- Enable debug logging for troubleshooting
- Contact development team for complex issues

## Conclusion

The enhanced chat context system significantly improves the user experience by providing AI models with conversation history and context. This leads to more coherent, relevant, and personalized responses while maintaining good performance and scalability.

The system is designed to be:

- **Easy to use**: Works automatically with existing chat functionality
- **Configurable**: Adjustable limits and behavior
- **Performant**: Optimized for speed and memory usage
- **Extensible**: Easy to add new AI models and features

Users will notice more intelligent responses that build upon previous conversations, creating a more natural and engaging chat experience.
