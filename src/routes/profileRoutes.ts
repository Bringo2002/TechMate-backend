import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// GET /api/profile - get logged-in user's profile
router.get("/", protect, getProfile);

// PUT /api/profile - update logged-in user's profile
router.put("/", protect, updateProfile);

export default router;
