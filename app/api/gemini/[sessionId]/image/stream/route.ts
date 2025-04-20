import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { v4 as uuid } from 'uuid';
import { GoogleGenAI } from '@google/genai';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const { content, image, imagefileType } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let argContents = content;

    if (image && image !== '') {
      const base64Data = image.split(',')[1];
      argContents = [
        { text: content },
        {
          inlineData: {
            mimeType: imagefileType,
            data: base64Data,
          },
        },
      ];
      console.log('Image data:', imagefileType);
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: argContents,
      config: {
        responseModalities: ['Text', 'Image'],
      },
    });

    if (!geminiResponse.candidates || geminiResponse.candidates.length === 0) {
      return NextResponse.json({ error: 'No response candidates from Gemini' }, { status: 500 });
    }

    const parts = geminiResponse.candidates[0].content?.parts || [];
    let imageUrl = '';

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        const fileName = `image_${uuid()}.png`;

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/imagekit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: buffer.toString('base64'),
            fileName,
            sessionId,
          }),
        });

        if (!uploadResponse.ok) {
          return NextResponse.json(
            { error: 'Failed to upload image to ImageKit' },
            { status: 500 }
          );
        }

        const { url } = await uploadResponse.json();
        imageUrl = url;

        await prisma.message.create({
          data: {
            chatSessionId: sessionId,
            role: 'assistant',
            content: null,
            imageUrl,
            promt: content,
          },
        });

        break; // Only one image expected
      }
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error generating and uploading image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
