import { NextResponse } from 'next/server';
import imagekit from '@/lib/imageKit'; // Import your ImageKit utility

interface ImageKitError {
  help?: string;
  message: string;
  reason: string;
}

export async function POST(req: Request) {
  try {
    const { imageUrl, fileName, sessionId } = await req.json();

    if (!imageUrl || !fileName || !sessionId) {
      return NextResponse.json(
        { message: 'imageUrl, fileName, and sessionId are required' },
        { status: 400 }
      );
    }

    const folder = `${process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER}/${sessionId}`;
    const result = await imagekit.upload({
      file: imageUrl,
      fileName: fileName, // Unique file name
      useUniqueFileName: true, // Avoid overwriting
      folder: folder, // Store inside sessionId folder
    });
    if (!result || !result.url) {
      return NextResponse.json({ message: 'Failed to upload image' }, { status: 500 });
    }
    // Append cache-busting timestamp
    const timestamp = Date.now();
    const cacheBustedUrl = `${result.url}?v=${timestamp}`;

    return new Response(JSON.stringify({ url: cacheBustedUrl }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Error uploading image to ImageKit:', error);
    return new Response(JSON.stringify({ message: 'Failed to upload image' }), { status: 500 });
  }
}

// ✅ DELETE ENTIRE FOLDER (sessionId)
export async function DELETE(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const folder = `${process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER}/${sessionId}`;

    try {
      await imagekit.deleteFolder(folder);
      console.log('✅ Folder deleted successfully:', folder);
    } catch (error: unknown) {
      const err = error as ImageKitError;

      // Handle "FOLDER_NOT_FOUND" error gracefully
      if (err?.reason === 'FOLDER_NOT_FOUND') {
        console.warn('⚠️ Folder not found, but treating as success:', folder);
        return NextResponse.json(
          { message: 'Folder not found, treating as deleted' },
          { status: 200 }
        );
      }

      throw error; // Re-throw for other errors
    }

    return NextResponse.json({ message: 'Folder deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('❌ DELETE Folder Error:', error);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
