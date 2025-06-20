import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import OpenAI from 'openai';
import {
  getChatContext,
  getRelevantChatContext,
  formatContextForOpenAI,
} from '@/lib/utils/chat-context';
import { chatConfig } from '@/lib/config/chat';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Get chat context from previous messages
    const contextMessages = chatConfig.context.useRelevantContext
      ? await getRelevantChatContext(sessionId, content, chatConfig.context.maxWords)
      : await getChatContext(sessionId, chatConfig.context.maxWords);

    // Format messages with context for OpenAI
    const systemPrompt = chatConfig.context.systemPrompts.bot;
    const messagesWithContext = formatContextForOpenAI(contextMessages, systemPrompt);

    // Add current user message
    messagesWithContext.push({ role: 'user', content: content });

    // Generate text response with GPT-4
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messagesWithContext,
      max_tokens: chatConfig.response.maxTokens,
      temperature: chatConfig.response.temperature,
    });

    const assistantContent =
      chatCompletion.choices?.[0]?.message?.content || 'No response generated';

    // Save the message to the database
    await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: assistantContent,
        promt: content,
      },
    });

    return NextResponse.json({ content: assistantContent });
  } catch (error) {
    console.error('Error generating text response:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
