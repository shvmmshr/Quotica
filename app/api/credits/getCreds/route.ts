import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma"; // Adjust the import path as necessary

const getCredits = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId } = req.query; // Extracting the userId from query params
  console.log("userId:", userId);
  // Check if userId is provided and is a string
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    // Fetch user data from Prisma, ensuring we also count credits
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId, // Find user by clerkId (Clerk's user ID)
      },
      include: {
        credits: true,
      },
    });

    // If user not found, return an error
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate total credits (assuming credits are stored in transactions, adjust this logic as necessary)

    // Return the total credits
    return res.status(200).json({ credits: user.credits });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default getCredits;
