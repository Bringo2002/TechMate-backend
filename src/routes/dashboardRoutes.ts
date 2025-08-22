// ======================================
// FILE: src/routes/dashboardRoutes.ts
// ======================================
import { Router } from "express";
import { overviewHandler, usersSeriesHandler, revenueSeriesHandler, requestsBreakdownHandler, recentRequestsHandler } from "../controllers/dashboardController";
import { protect } from "../middleware/authMiddleware"; // existing in your codebase
import { adminOnly } from "../middleware/adminOnly";
// Optional: import { dashboardLimiter } from "../middleware/rateLimiter";


const router = Router();


// If your dashboard is admin-only, keep adminOnly. If not, remove it.
router.get("/overview", protect, adminOnly, /* dashboardLimiter, */ overviewHandler);
router.get("/users", protect, adminOnly, /* dashboardLimiter, */ usersSeriesHandler);
router.get("/revenue", protect, adminOnly, /* dashboardLimiter, */ revenueSeriesHandler);
router.get("/requests", protect, adminOnly, /* dashboardLimiter, */ requestsBreakdownHandler);
router.get("/recent", protect, adminOnly, /* dashboardLimiter, */ recentRequestsHandler);


export default router;