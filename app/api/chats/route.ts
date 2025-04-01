import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { title } from "process";

// Fetch chats for a given userId
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Fetch chat sessions for the user
    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "desc", // Optional: Order by creation date (newest first)
      },
    });

    return NextResponse.json(chatSessions);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json(
      { error: "Error fetching chats" },
      { status: 500 }
    );
  }
}
