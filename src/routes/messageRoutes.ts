import { Router } from "express";
import { sendMessage, getConversation, getUserInbox } from "../controllers/messageController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Send a new message
router.post("/send", protect, sendMessage);

// Get conversation between logged-in user and another user
router.get("/conversation/:userId", protect, getConversation);

// Get inbox (latest message from each conversation)
router.get("/inbox", protect, getUserInbox);

export default router;
