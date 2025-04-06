import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';

type OpenAIImageRequest = {
  model: 'dall-e-2' | 'dall-e-3';
  prompt: string;
  n: number;
  size: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const url = req.nextUrl;

    // Extract all parameters from the URL
    const content = url.searchParams.get('content');
    const model = url.searchParams.get('model') || 'DALL·E 2';
    const quality = (url.searchParams.get('quality') as 'standard' | 'hd') || 'standard';
    const size = (url.searchParams.get('size') as OpenAIImageRequest['size']) || '256x256';

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const response = new NextResponse(null, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Determine the actual OpenAI model based on the selected option
          const openAiModel: OpenAIImageRequest['model'] = model.includes('DALL·E 3')
            ? 'dall-e-3'
            : 'dall-e-2';

          // Prepare the typed request body for OpenAI
          const requestBody: OpenAIImageRequest = {
            model: openAiModel,
            prompt: content,
            n: 1,
            size: size,
          };

          // Add quality parameter only for DALL-E 3
          if (openAiModel === 'dall-e-3') {
            requestBody.quality = quality == 'hd' ? 'hd' : 'standard';
          }

          // Generate image with DALL·E
          const openAiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
          });

          if (!openAiResponse.ok) {
            const errorData = await openAiResponse.json();
            throw new Error(errorData.error?.message || 'Failed to generate image');
          }

          const data = await openAiResponse.json();
          const imageUrl = data.data[0]?.url;

          if (!imageUrl) throw new Error('No image URL found');

          // Upload the generated image to ImageKit
          const fileName = `image_${uuid()}.png`;
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageUrl,
              fileName,
              sessionId,
            }),
          });

          if (!uploadResponse.ok) throw new Error('Failed to upload image to ImageKit');
          const { url: imageKitUrl } = await uploadResponse.json();

          // Save to database with model options
          await prisma.message.create({
            data: {
              chatSessionId: sessionId,
              role: 'assistant',
              content: null,
              imageUrl: imageKitUrl,
              promt: content,
            },
          });

          // Send ImageKit URL to the client
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ imageUrl: imageKitUrl })}\n\n`)
          );

          controller.close();
        } catch (error) {
          console.error('Error generating and uploading image:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, response);
  } catch (error) {
    console.error('Error in streaming response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
