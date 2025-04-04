import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const url = req.nextUrl;
    const content = url.searchParams.get('content');

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
          // Generate image with DALL·E
          const openAiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'dall-e-2',
              prompt: content,
              n: 1,
              size: '256x256',
            }),
          });

          if (!openAiResponse.ok) throw new Error('Failed to generate image');

          const data = await openAiResponse.json();
          const imageUrl = data.data[0]?.url;

          if (!imageUrl) throw new Error('No image URL found');

          // Upload the generated image to ImageKit
          const fileName = `image_${uuid()}}.png`;
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

          await prisma.message.create({
            data: {
              chatSessionId: sessionId,
              role: 'assistant',
              content: imageKitUrl, // Store the image link
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
