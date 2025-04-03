import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
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
          const imageUrl = `https://avatars.githubusercontent.com/u/95865224?v=4`;

          // Save the generated image URL to the database
          await prisma.message.create({
            data: {
              chatSessionId: sessionId,
              role: 'assistant',
              content: imageUrl, // Store the image link
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
