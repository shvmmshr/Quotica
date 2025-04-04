import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  // console.log("userId:", userId);

  if (!userId) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  try {
    // Fetch user data from Prisma
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ credits: user.credits || 0 }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
