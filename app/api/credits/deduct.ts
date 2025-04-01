import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Adjust the import path as necessary

const spendCredits = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.credits < amount) {
      return res.status(400).json({ error: "Insufficient credits" });
    }

    // Deduct credits from the user
    const updatedUser = await prisma.user.update({
      where: {
        clerkId: userId,
      },
      data: {
        credits: {
          decrement: amount, // Deduct the amount from the current credits
        },
      },
    });

    // Create a transaction log for the credit deduction
    await prisma.transaction.create({
      data: {
        userId: updatedUser.clerkId,
        type: "credit_spend",
        amount: -amount,
      },
    });

    return res.status(200).json({ credits: updatedUser.credits });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default spendCredits;
