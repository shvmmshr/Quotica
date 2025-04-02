import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // Adjust the import path as necessary
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await params;
    const { clerkId, content } = await req.json();
    console.log("sessionId:", sessionId);
    console.log("clerkId:", clerkId);
    console.log("content:", content);
    if (!clerkId || !content.trim()) {
      return NextResponse.json(
        { error: "clerkId and content are required" },
        { status: 400 }
      );
    }

    // Verify if the chat session exists and belongs to the provided Clerk ID
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId, userId: clerkId },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    // Create the user message
    const userMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: "user",
        content,
      },
    });

    // Simulate AI response
    const assistantMessage = await prisma.message.create({
      data: {
        chatSessionId: sessionId,
        role: "assistant",
        content: "This is a bot response!",
      },
    });

    return NextResponse.json([userMessage, assistantMessage], { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(req.url);
    const clerkId = searchParams.get("clerkId");
    console.log("sessionId:", sessionId);
    console.log("clerkId:", clerkId);
    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId is required" },
        { status: 400 }
      );
    }

    // Verify chat session ownership
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: sessionId, userId: clerkId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(chatSession.messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
