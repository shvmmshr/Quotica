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

    // Enhanced validation for base64 images from mobile devices
    const processedImageUrl = imageUrl;

    // Handle base64 data URLs properly
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(',')[1];
      if (!base64Data) {
        console.error('❌ No base64 data found in image URL');
        return NextResponse.json({ message: 'Invalid base64 image data' }, { status: 400 });
      }

      // Enhanced validation for base64 format
      try {
        const buffer = Buffer.from(base64Data, 'base64');

        // Check if buffer is valid and not empty
        if (buffer.length === 0) {
          console.error('❌ Empty image buffer');
          return NextResponse.json({ message: 'Empty image data' }, { status: 400 });
        }

        // Check if buffer is too small (likely corrupted)
        if (buffer.length < 100) {
          console.error('❌ Image buffer too small, possibly corrupted');
          return NextResponse.json({ message: 'Image data appears corrupted' }, { status: 400 });
        }

        // For mobile devices, validate common image file signatures
        const signature = buffer.toString('hex', 0, 4);
        const validSignatures = [
          'ffd8', // JPEG
          '8950', // PNG
          '4749', // GIF
          '5249', // WebP (RIFF)
          '0000', // Some mobile formats start with 0000
        ];

        const isValidImage = validSignatures.some((sig) =>
          signature.toLowerCase().startsWith(sig.toLowerCase())
        );

        if (!isValidImage) {
          console.error('❌ Invalid image file signature:', signature);
          return NextResponse.json({ message: 'Invalid image file format' }, { status: 400 });
        }

        console.log(
          '✅ Valid image detected, size:',
          buffer.length,
          'bytes, signature:',
          signature
        );
      } catch (error) {
        console.error('❌ Invalid base64 encoding:', error);
        return NextResponse.json({ message: 'Invalid base64 encoding' }, { status: 400 });
      }
    }

    const folder = `${process.env.NEXT_PUBLIC_IMAGEKIT_FOLDER}/${sessionId}`;

    try {
      const result = await imagekit.upload({
        file: processedImageUrl,
        fileName: fileName,
        useUniqueFileName: true,
        folder: folder,
        // Enhanced transformation for mobile optimization
        transformation: {
          pre: 'q_auto,f_auto,w_2048,h_2048,c_limit', // Auto quality, format, and size limit
        },
        tags: ['mobile-upload', 'chat-image'], // Add tags for tracking
      });

      if (!result || !result.url) {
        console.error('❌ ImageKit upload failed - no result or URL');
        return NextResponse.json(
          { message: 'Failed to upload image to ImageKit' },
          { status: 500 }
        );
      }

      console.log('✅ ImageKit upload successful:', result.url);

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
    } catch (uploadError) {
      console.error('❌ ImageKit upload error:', uploadError);

      // Provide more specific error messages for mobile debugging
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : 'Unknown upload error';

      return NextResponse.json(
        {
          message: 'Failed to upload image to ImageKit',
          error: errorMessage,
          details: 'This may be due to image format or size issues on mobile devices',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in ImageKit upload route:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        message: 'Failed to upload image',
        error: errorMessage,
        details: 'Server error during image processing',
      }),
      { status: 500 }
    );
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
