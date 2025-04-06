// app/api/analyze-image/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Enhanced system prompt with clear instructions
    const systemPrompt = `
      You are an expert image analyzer. Your task is to:
      1. Describe the image in detail, focusing on key elements
      2. Extract ALL visible text exactly as it appears
      3. Identify the overall mood and style
      4. Suggest possible improvements if requested
      5. Keep the description concise but comprehensive
      
      User will use your description to generate new images, so be precise about:
      - Colors
      - Composition
      - Text styles
      - Key objects and their relationships
    `;

    // Combine user prompt with our instructions
    const analysisPrompt = prompt
      ? `${prompt}\n\nAlso include the details mentioned above.`
      : `Please describe this image in detail including all the requested elements.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // Use 'high' for better analysis
              },
            },
          ],
        },
      ],
      max_tokens: 100,
      temperature: 0.2, // Lower temperature for more factual responses
    });

    const description = response.choices[0]?.message?.content;

    if (!description) {
      throw new Error('No description generated');
    }

    return NextResponse.json({
      success: true,
      description,
      analysisDetails: {
        model: 'gpt-4-turbo',
        tokensUsed: response.usage?.total_tokens,
      },
    });
  } catch (error) {
    console.error('Error analyzing image:', error);

    // More detailed error responses
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: 'AI service error',
          message: error.message,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Image analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
