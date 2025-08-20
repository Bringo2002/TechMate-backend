import { Router, Request, Response } from "express";
import { register, login, refresh } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import authLimiter from "../middleware/rateLimiter";

const router = Router();

// Auth routes with rate limiting
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Refresh token route
router.post("/refresh", refresh);

// Protected route to get current user
router.get("/me", protect, (req: Request & { user?: any }, res: Response) => {
  res.json(req.user);
});

export default router;
