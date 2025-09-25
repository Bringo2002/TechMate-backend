import { Request, Response } from "express";
import prisma from "../prismaClient.js";

/**
 * Send a new message
 * @route POST /api/messages/send
 * This endpoint allows a logged-in user (req.user) to send a message to another user.
 * Validates the receiverId and content, then creates a new message in the database.
 */
export const sendMessage = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver and content are required" });
    }

    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id, // currently logged-in user
        receiverId,
        content,
      },
    });

    // Return the created message
    res.status(201).json(message);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to send message", error: err });
  }
};

/**
 * Get conversation between logged-in user and another user
 * @route GET /api/messages/conversation/:userId
 * Fetches all messages exchanged between req.user and the specified userId,
 * ordered chronologically (oldest first).
 */
export const getConversation = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    res.json(messages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch conversation", error: err });
  }
};

/**
 * Get inbox (latest message from each conversation)
 * @route GET /api/messages/inbox
 * Returns a summary of the latest message from each conversation the logged-in user is involved in.
 * Groups messages by the conversation partner (other user).
 */
export const getUserInbox = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    // Fetch all messages where user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      orderBy: { createdAt: "desc" }, // latest first
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } },
      },
    });

    // Group messages by the conversation partner
    const conversations: any = {};
    for (const msg of messages) {
      const key = msg.senderId === req.user.id ? msg.receiverId : msg.senderId;

      if (!conversations[key]) {
        conversations[key] = msg; // keep the first (latest) message per conversation
      }
    }

    // Return only the latest message from each conversation
    res.json(Object.values(conversations));
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch inbox", error: err });
  }
};
