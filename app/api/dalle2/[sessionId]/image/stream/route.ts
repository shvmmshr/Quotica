import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = await params;
    const url = req.nextUrl; // Get the full URL
    const content = url.searchParams.get('content'); // Use .get() to extract the 'content' parameter

    // Ensure headers are set for SSE (Server-Sent Events)
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
          // Call the OpenAI API to generate an image based on a prompt
          const prompt = content; // Use the provided content as the prompt

          const openAiResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Use your OpenAI API Key from .env
            },
            body: JSON.stringify({
              model: 'dall-e-2', // Model can be "dall-e-2" or "dall-e-3" depending on your requirement
              prompt,
              n: 1,
              size: '256x256', // Image size
            }),
          });

          if (!openAiResponse.ok) {
            throw new Error('Failed to generate image');
          }

          const data = await openAiResponse.json();
          const imageUrl = data.data[0]?.url;

          if (!imageUrl) {
            throw new Error('No image URL found');
          }

          // Save the generated image URL to the database
          await prisma.message.create({
            data: {
              chatSessionId: sessionId,
              role: 'assistant',
              content: imageUrl, // Save the image link to the database
            },
          });

          // Send event to client with the image URL
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ imageUrl })}\n\n`));

          // Close the stream after sending the image URL
          controller.close();
        } catch (error) {
          console.error('Error generating image:', error);
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
