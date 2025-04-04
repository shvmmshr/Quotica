import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary
import { v4 as uuid } from 'uuid';
export async function POST(req: Request) {
  try {
    const { userId, creds } = await req.json();
    const numCreds = Number(creds);

    // Validate the input
    if (!userId || typeof numCreds !== 'number' || numCreds < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Get the current user data to check if they have enough credits
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the user has enough credits
    if (user.credits < numCreds) {
      return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
    }

    // Deduct the credits
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: { credits: { decrement: numCreds } },
    });

    const transaction = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        type: 'debit',
        amount: numCreds,
        creds: creds,
        transactionNumber: `pay_${uuid()}`,
      }),
    });
    await transaction.json();

    return NextResponse.json(
      { message: 'Credits deducted successfully', credits: updatedUser.credits },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deducting credits:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
