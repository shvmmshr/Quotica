import prisma from '@/lib/prisma';

export interface ContextMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  imageUrl?: string;
}

/**
 * Gets recent messages from a chat session for context, limited to approximately 10,000 words
 * @param sessionId The chat session ID
 * @param maxWords Maximum number of words to include (default: 10000)
 * @returns Array of messages formatted for AI context
 */
export async function getChatContext(
  sessionId: string,
  maxWords: number = 10000
): Promise<ContextMessage[]> {
  try {
    // Fetch recent messages from the database, ordered by creation date (most recent first)
    const messages = await prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Take up to 50 recent messages initially
    });

    const contextMessages: ContextMessage[] = [];
    let totalWords = 0;

    // Process messages in reverse order (oldest first) for proper context flow
    for (const message of messages.reverse()) {
      // Skip messages without content or prompts
      if (!message.content && !message.promt) continue;

      // Use content for user messages, or promt for assistant messages as fallback
      const messageContent = message.content || message.promt || '';
      const wordCount = messageContent.split(/\s+/).filter((word) => word.length > 0).length;

      // Check if adding this message would exceed the word limit
      if (totalWords + wordCount > maxWords && contextMessages.length > 0) {
        break;
      }

      const contextMessage: ContextMessage = {
        role: message.role as 'user' | 'assistant' | 'system',
        content: messageContent,
      };

      // Include image URL if present
      if (message.imageUrl) {
        contextMessage.imageUrl = message.imageUrl;
      }

      contextMessages.push(contextMessage);
      totalWords += wordCount;
    }

    return contextMessages;
  } catch (error) {
    console.error('Error fetching chat context:', error);
    return [];
  }
}

/**
 * Formats context messages for OpenAI API
 * @param contextMessages Array of context messages
 * @param systemPrompt Optional system prompt to prepend
 * @returns Array formatted for OpenAI chat completion
 */
export function formatContextForOpenAI(
  contextMessages: ContextMessage[],
  systemPrompt?: string
): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
  const formattedMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  // Add system prompt if provided
  if (systemPrompt) {
    formattedMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  // Add context messages
  for (const message of contextMessages) {
    let content = message.content;

    // For assistant messages, provide context about what was generated
    if (message.role === 'assistant' && message.imageUrl) {
      content = `[Generated image for prompt: "${content}"]`;
    }

    formattedMessages.push({
      role: message.role,
      content,
    });
  }

  return formattedMessages;
}

/**
 * Formats context messages for Google Gemini API
 * @param contextMessages Array of context messages
 * @param systemPrompt Optional system prompt to prepend
 * @returns String formatted for Gemini
 */
export function formatContextForGemini(
  contextMessages: ContextMessage[],
  systemPrompt?: string
): string {
  let contextString = '';

  // Add system prompt if provided
  if (systemPrompt) {
    contextString += `System: ${systemPrompt}\n\n`;
  }

  // Add conversation history
  if (contextMessages.length > 0) {
    contextString += 'Previous conversation:\n';
    for (const message of contextMessages) {
      const role = message.role === 'assistant' ? 'Assistant' : 'User';
      let content = message.content;

      // For assistant messages with images, provide context
      if (message.role === 'assistant' && message.imageUrl) {
        content = `[Generated image for: "${content}"]`;
      }

      contextString += `${role}: ${content}\n`;
    }
    contextString += '\nCurrent request:\n';
  }

  return contextString;
}

/**
 * Gets contextually relevant messages based on the current request
 * @param sessionId The chat session ID
 * @param currentMessage The current message to find context for
 * @param maxWords Maximum number of words to include (default: 10000)
 * @returns Array of relevant messages formatted for AI context
 */
export async function getRelevantChatContext(
  sessionId: string,
  currentMessage: string,
  maxWords: number = 10000
): Promise<ContextMessage[]> {
  try {
    // Fetch recent messages from the database
    const messages = await prisma.message.findMany({
      where: { chatSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
      take: 100, // Take more messages for better context selection
    });

    if (messages.length === 0) return [];

    // Extract keywords from the current message
    const currentKeywords = extractKeywords(currentMessage);

    // Score messages based on relevance
    const scoredMessages = messages.map((message) => {
      const messageContent = message.content || message.promt || '';
      const messageKeywords = extractKeywords(messageContent);

      // Calculate relevance score based on keyword overlap
      const keywordScore = calculateKeywordOverlap(currentKeywords, messageKeywords);

      // Boost score for recent messages
      const recencyScore = messages.indexOf(message) / messages.length;
      const finalScore = keywordScore + recencyScore * 0.3;

      return {
        message,
        score: finalScore,
        content: messageContent,
      };
    });

    // Sort by relevance score and select top messages
    const relevantMessages = scoredMessages
      .filter((item) => item.content.length > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Take top 20 most relevant

    // Convert to context messages and respect word limit
    const contextMessages: ContextMessage[] = [];
    let totalWords = 0;

    // Always include the most recent few messages for conversation flow
    const recentMessages = messages.slice(0, 5).reverse();
    for (const message of recentMessages) {
      const messageContent = message.content || message.promt || '';
      if (!messageContent) continue;

      const wordCount = messageContent.split(/\s+/).filter((word) => word.length > 0).length;
      if (totalWords + wordCount > maxWords && contextMessages.length > 0) break;

      const contextMessage: ContextMessage = {
        role: message.role as 'user' | 'assistant' | 'system',
        content: messageContent,
      };

      if (message.imageUrl) {
        contextMessage.imageUrl = message.imageUrl;
      }

      contextMessages.push(contextMessage);
      totalWords += wordCount;
    }

    // Add highly relevant messages that aren't already included
    for (const item of relevantMessages) {
      if (totalWords >= maxWords) break;

      // Skip if message is already included
      const alreadyIncluded = contextMessages.some(
        (ctx) => ctx.content === item.content && ctx.role === item.message.role
      );
      if (alreadyIncluded) continue;

      const wordCount = item.content.split(/\s+/).filter((word) => word.length > 0).length;
      if (totalWords + wordCount > maxWords) break;

      const contextMessage: ContextMessage = {
        role: item.message.role as 'user' | 'assistant' | 'system',
        content: item.content,
      };

      if (item.message.imageUrl) {
        contextMessage.imageUrl = item.message.imageUrl;
      }

      contextMessages.push(contextMessage);
      totalWords += wordCount;
    }

    return contextMessages;
  } catch (error) {
    console.error('Error fetching relevant chat context:', error);
    return [];
  }
}

/**
 * Extract keywords from a message
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'up',
    'about',
    'into',
    'through',
    'during',
    'before',
    'after',
    'above',
    'below',
    'between',
    'among',
    'under',
    'over',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'i',
    'you',
    'he',
    'she',
    'it',
    'we',
    'they',
    'me',
    'him',
    'her',
    'us',
    'them',
    'my',
    'your',
    'his',
    'her',
    'its',
    'our',
    'their',
    'mine',
    'yours',
    'hers',
    'ours',
    'theirs',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .slice(0, 10); // Take top 10 keywords
}

function calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
  if (keywords1.length === 0 || keywords2.length === 0) return 0;

  const set1 = new Set(keywords1);
  const set2 = new Set(keywords2);
  const intersection = new Set([...set1].filter((x) => set2.has(x)));

  return intersection.size / Math.max(set1.size, set2.size);
}
