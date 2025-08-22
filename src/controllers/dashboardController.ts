// ======================================
// FILE: src/controllers/dashboardController.ts
// ======================================
import { Request, Response } from "express";
import { rangeQuerySchema } from "../validators/dashboardValidators";
import {
  getOverview,
  getUserGrowth,
  getRevenueSeries,
  getRequestBreakdown,
  getRecentRequests,
} from "../services/dashboardService";
import { sendCachedJson } from "../utils/httpCache";

// ---------------------------
// Overview Handler
// ---------------------------
export const overviewHandler = async (req: Request, res: Response) => {
  try {
    const { from, to } = rangeQuerySchema.parse(req.query);
    const data = await getOverview(from, to);
    return sendCachedJson(req, res, data);
  } catch (error: any) {
    console.error("Error in overviewHandler:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid date range", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------------------
// Users Series Handler
// ---------------------------
export const usersSeriesHandler = async (req: Request, res: Response) => {
  try {
    const { from, to, bucket, limit } = rangeQuerySchema.parse(req.query);
    const data = await getUserGrowth(from, to, bucket, limit);
    return sendCachedJson(req, res, data);
  } catch (error: any) {
    console.error("Error in usersSeriesHandler:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid query parameters", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------------------
// Revenue Series Handler
// ---------------------------
export const revenueSeriesHandler = async (req: Request, res: Response) => {
  try {
    const { from, to, bucket, limit } = rangeQuerySchema.parse(req.query);
    const data = await getRevenueSeries(from, to, bucket, limit);
    return sendCachedJson(req, res, data);
  } catch (error: any) {
    console.error("Error in revenueSeriesHandler:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid query parameters", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------------------
// Requests Breakdown Handler
// ---------------------------
export const requestsBreakdownHandler = async (req: Request, res: Response) => {
  try {
    const { from, to } = rangeQuerySchema.parse(req.query);
    const data = await getRequestBreakdown(from, to);
    return sendCachedJson(req, res, data);
  } catch (error: any) {
    console.error("Error in requestsBreakdownHandler:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid date range", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ---------------------------
// Recent Requests Handler
// (Optional: if you implement /recent endpoint)
// ---------------------------
export const recentRequestsHandler = async (req: Request, res: Response) => {
  try {
    const { limit } = rangeQuerySchema.parse(req.query);
    const data = await getRecentRequests(limit);
    return sendCachedJson(req, res, data);
  } catch (error: any) {
    console.error("Error in recentRequestsHandler:", error);
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Invalid query parameters", details: error.errors });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};
