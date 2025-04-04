import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Adjust the import path as necessary
// Fetch a specific chat session by sessionId
export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: { messages: true }, // Include messages in the response
    });

    if (!chatSession) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    return NextResponse.json(chatSession);
  } catch (error) {
    console.error('Error fetching chat session:', error);
    return NextResponse.json({ error: 'Failed to fetch chat session' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return NextResponse.json({ error: 'Failed to delete chat session' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const { title } = await req.json();

  if (!sessionId || !title) {
    return NextResponse.json({ error: 'Session ID and title are required' }, { status: 400 });
  }

  try {
    const updatedChat = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });

    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 });
  }
}
