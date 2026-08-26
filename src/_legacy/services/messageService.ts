import prisma from "../prismaClient.js"; // Import the Prisma client instance to interact with the database

/**
 * Send a message from one user to another
 * @param senderId - ID of the user sending the message
 * @param receiverId - ID of the user receiving the message
 * @param content - The message text/content
 * @returns The created message, including sender and receiver info
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
) => {
  // Create a new message record in the database
  return await prisma.message.create({
    data: {
      senderId,    // Link the message to the sender
      receiverId,  // Link the message to the receiver
      content,     // Save the message content
    },
    include: {
      sender: true,   // Include sender user details in the returned object
      receiver: true, // Include receiver user details in the returned object
    },
  });
};

/**
 * Get the full message history between two users
 * @param userId - ID of the first user
 * @param otherUserId - ID of the second user
 * @returns List of messages exchanged between the two users, sorted oldest to newest
 */
export const getMessagesBetweenUsers = async (
  userId: string,
  otherUserId: string
) => {
  return await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId }, // Messages sent by userId to otherUserId
        { senderId: otherUserId, receiverId: userId }, // Messages sent by otherUserId to userId
      ],
    },
    orderBy: { createdAt: "asc" }, // Order messages by creation time ascending (oldest first)
  });
};

/**
 * Get all unique conversations of a user
 * @param userId - ID of the user
 * @returns List of conversations where the user is either sender or receiver,
 *          showing the latest messages first, including sender and receiver details
 */
export const getUserConversations = async (userId: string) => {
  return await prisma.message.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }], // All messages involving this user
    },
    orderBy: { createdAt: "desc" }, // Sort by newest messages first
    distinct: ["senderId", "receiverId"], // Ensure only unique conversation pairs are returned
    include: {
      sender: true,   // Include sender details
      receiver: true, // Include receiver details
    },
  });
};
