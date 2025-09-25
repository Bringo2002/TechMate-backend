import { Router } from "express";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = Router();

// GET /api/profile - get logged-in user's profile
router.get("/", protect, getProfile);

// PUT /api/profile - update logged-in user's profile
router.put("/", protect, updateProfile);

// Avatar upload middleware
const upload = multer({ dest: "uploads/avatars" });

// setup multer for avatar uploads
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
