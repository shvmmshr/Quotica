import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';
import OpenAI from 'openai';
import { getChatContext, getRelevantChatContext } from '@/lib/utils/chat-context';
import { chatConfig } from '@/lib/config/chat';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { content, size = '1024x1024' } = await req.json();

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

    // Create enhanced prompt with context for better image generation
    let enhancedPrompt = content;
    if (contextMessages.length > 0) {
      // Get the last few messages for immediate context
      const recentContext = contextMessages
        .slice(-5)
        .map((msg) => {
          const role = msg.role === 'assistant' ? 'Previous generation' : 'Previous request';
          return `${role}: ${msg.content}`;
        })
        .join('\n');

      enhancedPrompt = `${chatConfig.context.systemPrompts.gptImage}\n\nContext from recent conversation:\n${recentContext}\n\nCurrent request: ${content}`;
    }

    // Generate image with DALL-E
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: size as '1024x1024' | '1024x1536' | '1536x1024',
    });
    // console.log('Image  generation response:', response);
    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }

    const imageB64 = response.data[0].b64_json;
    const fileName = `image_${uuid()}.png`;

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: `data:image/png;base64,${imageB64}`,
        fileName,
        sessionId,
      }),
    });

    if (!uploadResponse.ok) {
      return NextResponse.json({ error: 'Failed to upload image to ImageKit' }, { status: 500 });
    }

    const { url } = await uploadResponse.json();

    // Save the message to the database
    await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: null,
        imageUrl: url,
        promt: content,
      },
    });

    return NextResponse.json({ imageUrl: url });
  } catch (error) {
    console.error('Error generating and uploading image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
