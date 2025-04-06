import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Ensure headers are set for SSE
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
        // Simulate AI processing delay
        setTimeout(async () => {
          const imageUrl = `https://picsum.photos/1080/1080?random=${uuid()}`;
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
          // Save the generated image URL to the database
          const { url: imageKitUrl } = await uploadResponse.json();

          await prisma.message.create({
            data: {
              chatSessionId: sessionId,
              role: 'assistant',
              content: '', // Store the image link
              imageUrl: imageKitUrl,
              promt: '', // Store the prompt if needed
            },
          });

          // Send event to client
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ imageUrl })}\n\n`));

          controller.close(); // Close SSE connection after sending the image URL
        }, 3000);
      },
    });

    return new Response(stream, response);
  } catch (error) {
    console.error('Error in streaming response:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
