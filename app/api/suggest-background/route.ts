import { NextResponse } from 'next/server';
import { BackgroundSuggestion } from '@/lib/types';
// Import OpenAI only if you're using it
// import OpenAI from "openai";

// Initialize OpenAI client - only needed if using OpenAI option
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Unsplash API credentials
// const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// Pexels API credentials
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

export async function POST(request: Request) {
  try {
    const { text, source = 'mock', prompt } = await request.json();

    if (!text && !prompt) {
      return NextResponse.json(
        { error: 'Invalid request. Text or prompt is required.' },
        { status: 400 }
      );
    }

    // Choose the source based on the request
    switch (source) {
      case 'gemini':
        if (!prompt) {
          return NextResponse.json(
            { error: 'Prompt is required for Gemini image generation' },
            { status: 400 }
          );
        }
        const geminiBackgrounds = await getGeminiBackgrounds(prompt);
        return NextResponse.json({ backgrounds: geminiBackgrounds });

      case 'pexels':
        const pexelsBackgrounds = await getPexelsBackgrounds(text);
        return NextResponse.json({ backgrounds: pexelsBackgrounds });

      case 'mock':
      default:
        // Default to mock implementation
        return NextResponse.json({
          backgrounds: suggestBackgroundsMock(text),
        });
    }
  } catch (error) {
    console.error('Error suggesting backgrounds:', error);
    return NextResponse.json({ error: 'Failed to suggest backgrounds' }, { status: 500 });
  }
}

// Gemini API implementation (simulated for now)
async function getGeminiBackgrounds(prompt: string): Promise<BackgroundSuggestion[]> {
  try {
    // This would be a real API call in a production app
    // For now we'll simulate response with a mock
    console.log('Generating images with Gemini using prompt:', prompt);

    // In a real implementation, you would call the Gemini API here
    // and process the image results

    // Simulate a 1-second delay to mimic API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return simulated images
    return [
      {
        type: 'image',
        value: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
        description: 'Generated with Gemini AI',
      },
      {
        type: 'image',
        value: 'https://images.pexels.com/photos/1054201/pexels-photo-1054201.jpeg',
        description: 'Generated with Gemini AI',
      },
      {
        type: 'image',
        value: 'https://images.pexels.com/photos/2310713/pexels-photo-2310713.jpeg',
        description: 'Generated with Gemini AI',
      },
      {
        type: 'image',
        value: 'https://images.pexels.com/photos/531767/pexels-photo-531767.jpeg',
        description: 'Generated with Gemini AI',
      },
    ];
  } catch (error) {
    console.error('Error with Gemini image generation:', error);
    // Fallback to mock if there's an error
    return suggestBackgroundsMock('');
  }
}

// Pexels API implementation
async function getPexelsBackgrounds(text: string): Promise<BackgroundSuggestion[]> {
  try {
    // Extract keywords from the text
    const keywords = extractKeywords(text);
    const backgrounds: BackgroundSuggestion[] = [];

    // Get images for each keyword (limit to 4 total)
    for (let i = 0; i < Math.min(keywords.length, 4); i++) {
      const keyword = keywords[i];
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          keyword
        )}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: PEXELS_API_KEY as string,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.photos && data.photos.length > 0) {
          backgrounds.push({
            type: 'image',
            value: data.photos[0].src.large,
            description: `${keyword} (via Pexels by ${data.photos[0].photographer})`,
          });
        }
      }
    }

    // If we couldn't get enough images from keywords, add some based on general topics
    if (backgrounds.length < 4) {
      const generalKeywords = ['nature', 'landscape', 'abstract', 'sky'];
      for (let i = 0; backgrounds.length < 4 && i < generalKeywords.length; i++) {
        const keyword = generalKeywords[i];
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(
            keyword
          )}&per_page=1&orientation=landscape`,
          {
            headers: {
              Authorization: PEXELS_API_KEY as string,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.photos && data.photos.length > 0) {
            backgrounds.push({
              type: 'image',
              value: data.photos[0].src.large,
              description: `${keyword} (via Pexels by ${data.photos[0].photographer})`,
            });
          }
        }
      }
    }

    return backgrounds;
  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    // Fallback to mock if there's an error
    return suggestBackgroundsMock(text);
  }
}

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);

  // Remove common words
  const commonWords = [
    'that',
    'this',
    'with',
    'from',
    'they',
    'have',
    'what',
    'when',
    'were',
    'will',
    'would',
    'make',
    'like',
    'time',
    'just',
    'know',
    'take',
    'people',
    'year',
    'your',
    'good',
    'some',
    'could',
    'them',
    'about',
    'then',
    'than',
    'other',
    'more',
    'these',
    'which',
    'their',
    'thing',
  ];

  // Filter out common words
  const filteredWords = words.filter((word) => !commonWords.includes(word.toLowerCase()));

  // Get unique words
  const uniqueWords = Array.from(new Set(filteredWords));

  return uniqueWords;
}

// Mock implementation (fallback)
function suggestBackgroundsMock(text: string): BackgroundSuggestion[] {
  // Sample gradients
  console.log('Suggesting mock backgrounds based on text:', text);
  const gradients = [
    {
      value: 'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
      description: 'Deep Blue',
    },
    {
      value: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
      description: 'Sunset',
    },
    {
      value: 'linear-gradient(135deg, #4BC0C8 0%, #C779D0 50%, #FEAC5E 100%)',
      description: 'Pastel Rainbow',
    },
    {
      value: 'linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)',
      description: 'Fresh Mint',
    },
    {
      value: 'linear-gradient(135deg, #5B247A 0%, #1BCEDF 100%)',
      description: 'Cosmic Fusion',
    },
    {
      value: 'linear-gradient(135deg, #184E68 0%, #57CA85 100%)',
      description: 'Forest',
    },
    {
      value: 'linear-gradient(135deg, #65379B 0%, #886AEA 100%)',
      description: 'Purple Mist',
    },
    {
      value: 'linear-gradient(135deg, #FF057C 0%, #8D0B93 50%, #321575 100%)',
      description: 'Vibrant Pink-Purple',
    },
    {
      value: 'linear-gradient(135deg, #F9D423 0%, #FF4E50 100%)',
      description: 'Warm Flame',
    },
    {
      value: 'linear-gradient(135deg, #30CFD0 0%, #330867 100%)',
      description: 'Winter Neva',
    },
    {
      value: 'linear-gradient(135deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)',
      description: 'Neon Purple',
    },
    {
      value: 'linear-gradient(135deg, #396AFC 0%, #2948FF 100%)',
      description: 'Electric Blue',
    },
  ];

  // Sample colors
  const colors = [
    {
      value: '#6366F1',
      description: 'Indigo',
    },
    {
      value: '#0ea5e9',
      description: 'Sky Blue',
    },
    {
      value: '#14b8a6',
      description: 'Teal',
    },
    {
      value: '#10b981',
      description: 'Emerald',
    },
    {
      value: '#84cc16',
      description: 'Lime',
    },
    {
      value: '#eab308',
      description: 'Yellow',
    },
    {
      value: '#f97316',
      description: 'Orange',
    },
    {
      value: '#ef4444',
      description: 'Red',
    },
    {
      value: '#ec4899',
      description: 'Pink',
    },
    {
      value: '#8b5cf6',
      description: 'Violet',
    },
    {
      value: '#0f172a',
      description: 'Slate',
    },
    {
      value: '#1e293b',
      description: 'Dark Blue',
    },
  ];

  // Sample image URLs (nature photos, landscapes, abstract)
  const images = [
    {
      value: 'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg',
      description: 'Mountain Landscape',
    },
    {
      value: 'https://images.pexels.com/photos/1054201/pexels-photo-1054201.jpeg',
      description: 'Ocean Wave',
    },
    {
      value: 'https://images.pexels.com/photos/2310713/pexels-photo-2310713.jpeg',
      description: 'Abstract Art',
    },
    {
      value: 'https://images.pexels.com/photos/572780/pexels-photo-572780.jpeg',
      description: 'Starry Sky',
    },
    {
      value: 'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg',
      description: 'Forest Path',
    },
    {
      value: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg',
      description: 'Desert Sand',
    },
    {
      value: 'https://images.pexels.com/photos/33545/sunrise-phu-quoc-island-ocean.jpg',
      description: 'Sunrise',
    },
    {
      value: 'https://images.pexels.com/photos/531767/pexels-photo-531767.jpeg',
      description: 'Cloudy Sky',
    },
  ];

  // Combine all potential backgrounds
  const allBackgrounds: BackgroundSuggestion[] = [
    ...gradients.map((g) => ({ type: 'gradient' as const, ...g })),
    ...colors.map((c) => ({ type: 'color' as const, ...c })),
    ...images.map((i) => ({ type: 'image' as const, ...i })),
  ];

  // Shuffle the array
  const shuffled = shuffleArray(allBackgrounds);

  // Return a selection of 8 backgrounds (4 from each category)
  const results: BackgroundSuggestion[] = [];

  // Add 1-2 colors
  const colorCount = Math.floor(Math.random() * 2) + 1;
  shuffled
    .filter((bg) => bg.type === 'color')
    .slice(0, colorCount)
    .forEach((bg) => results.push(bg));

  // Add 2-3 gradients
  const gradientCount = Math.floor(Math.random() * 2) + 2;
  shuffled
    .filter((bg) => bg.type === 'gradient')
    .slice(0, gradientCount)
    .forEach((bg) => results.push(bg));

  // Add 3-4 images
  const imageCount = Math.min(8 - results.length, 4);
  shuffled
    .filter((bg) => bg.type === 'image')
    .slice(0, imageCount)
    .forEach((bg) => results.push(bg));

  // Return exactly 8 backgrounds
  return shuffleArray(results).slice(0, 8);
}

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
