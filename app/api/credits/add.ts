// pages/api/credits/add.ts

import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Adjust the import path as necessary

const addCredits = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, amount } = req.body;

  if (
    !userId ||
    typeof userId !== "string" ||
    !amount ||
    typeof amount !== "number" ||
    amount <= 0
  ) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    // Update the user's credits
    const user = await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        credits: {
          increment: amount, // Add the amount to the current credits
        },
      },
    });

    // Create a transaction log for adding credits
    await prisma.transaction.create({
      data: {
        userId: user.clerkId,
        type: "credit_add",
        amount,
      },
    });

    return res.status(200).json({ credits: user.credits });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default addCredits;
