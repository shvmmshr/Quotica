import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';
import OpenAI, { toFile } from 'openai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { prompt, imageBase64, size = '1024x1024' } = await req.json();

    if (!prompt || !imageBase64) {
      return NextResponse.json({ error: 'Both image and prompt are required' }, { status: 400 });
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Extract base64 data - handle both with and without data URI prefix
    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // Create a Buffer from the base64 string
    const buffer = Buffer.from(base64Data, 'base64');

    // Convert buffer to file object using OpenAI's toFile utility
    const imageFile = await toFile(buffer, 'image.png', { type: 'image/png' });

    // Edit image with DALL-E
    // Note: Edit API doesn't support quality parameter, only size
    const response = await openai.images.edit({
      model: 'gpt-image-1',
      image: imageFile,
      prompt: prompt,
      n: 1,
      // @ts-expect-error because no type definition for size
      size: size as '1024x1024' | '1024x1536' | '1536x1024',
    });

    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      return NextResponse.json({ error: 'Failed to edit image' }, { status: 500 });
    }

    const editedImageB64 = response.data[0].b64_json;
    const fileName = `edited_image_${uuid()}.png`;

    const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageUrl: `data:image/png;base64,${editedImageB64}`,
        fileName,
        sessionId,
      }),
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to upload edited image to ImageKit' },
        { status: 500 }
      );
    }

    const { url } = await uploadResponse.json();

    // Save the message to the database
    await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: 'assistant',
        content: null,
        imageUrl: url,
        promt: prompt,
      },
    });

    return NextResponse.json({ imageUrl: url });
  } catch (error) {
    console.error('Error editing and uploading image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
