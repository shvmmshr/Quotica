import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary

export async function POST(req: Request) {
  try {
    const { userId, creds } = await req.json();
    const numCreds = Number(creds);
    if (!userId || typeof numCreds !== 'number' || numCreds <= 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Update user's credits in database
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { credits: { increment: numCreds } },
    });

    return NextResponse.json(
      { message: 'Credits added successfully', credits: user.credits },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
