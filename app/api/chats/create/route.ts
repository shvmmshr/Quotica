import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
// Handler for creating or updating a chat session

// Function to create or update a chat session
async function createOrUpdateChatSession(
  req: NextApiRequest,
  res: NextApiResponse,
  sessionId: string | null,
  userId: string,
  message: string,
  title: string
) {
  try {
    // If sessionId is provided, we update an existing session
    if (sessionId) {
      // Fetch the existing session
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: true },
      });

      if (chatSession) {
        // Update the existing session by adding the new message
        await prisma.message.create({
          data: {
            chatSessionId: sessionId,
            role: "user",
            content: message,
          },
        });

        return res
          .status(200)
          .json({ message: "Message added to existing session" });
      } else {
        // If the session doesn't exist, create a new session
        const newSession = await prisma.chatSession.create({
          data: {
            userId: userId,
            title: title || "Untitled", // Set default title if not provided
            messages: {
              create: [{ role: "user", content: message }],
            },
          },
        });

        return res
          .status(201)
          .json({ sessionId: newSession.id, message: "New session created" });
      }
    } else {
      // If no sessionId, create a new session
      const newSession = await prisma.chatSession.create({
        data: {
          userId: userId,
          title: title || "Untitled", // Default title
          messages: {
            create: [{ role: "user", content: message }],
          },
        },
      });

      return res
        .status(201)
        .json({ sessionId: newSession.id, message: "New session created" });
    }
  } catch (error) {
    console.error("Error creating or updating chat session:", error);
    return res
      .status(500)
      .json({ message: "Error creating or updating chat session" });
  }
}
