import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path if needed

// **GET Transactions by userId**
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Sort by latest transactions
    });

    return NextResponse.json({ success: true, transactions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// **POST - Add a new transaction**
export async function POST(req: NextRequest) {
  try {
    const { userId, type, amount, transactionNumber, creds } = await req.json();

    // Validate inputs
    if (!userId || !type || 0 > amount || !transactionNumber || creds < 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const numCreds = Number(creds);
    const numAmount = Number(amount);
    const newTransaction = await prisma.transaction.create({
      data: {
        userId,
        type,
        amount: numAmount,
        creds: numCreds,
        transactionNumber,
      },
    });

    return NextResponse.json({ success: true, transaction: newTransaction }, { status: 201 });
  } catch (error) {
    console.error('Error adding transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
