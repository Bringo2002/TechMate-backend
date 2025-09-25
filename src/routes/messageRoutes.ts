import { Router } from "express";
import { sendMessage, getConversation, getUserInbox } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Send a new message
router.post("/send", protect, sendMessage);

// Get conversation between logged-in user and another user
router.get("/conversation/:userId", protect, getConversation);

// Get inbox (latest message from each conversation)
router.get("/inbox", protect, getUserInbox);

export default router;
