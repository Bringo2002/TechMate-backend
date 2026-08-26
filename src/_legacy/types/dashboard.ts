// TechMate — Dashboard Backend APIs (v1)
// Layered structure with validation (zod), service layer, and clean controllers.
// Endpoints:
// GET /api/dashboard/overview
// GET /api/dashboard/users?from=2025-07-01&to=2025-08-22&bucket=month
// GET /api/dashboard/requests?from=...&to=...
// GET /api/dashboard/revenue?from=...&to=...&bucket=month
// GET /api/dashboard/recent?limit=10
// Notes:
// - Assumes Postgres. If you're on MySQL, adapt the raw SQL date functions accordingly.
// - Protect routes with your existing `protect` middleware. Optionally gate with `adminOnly`.
// - Add the router in src/index.ts: `app.use("/api/dashboard", dashboardRoutes);`


// ======================================
// FILE: src/types/dashboard.ts
// ======================================
export type TimeBucket = "day" | "week" | "month";


export interface OverviewStats {
totalUsers: number;
activeUsers?: number; // optional: if you later track lastSeen
totalRequests: number;
openRequests: number;
closedRequests: number;
totalRevenue: number; // cents or major units depending on your Payment model
}


export interface SeriesPoint<T = number> {
bucket: string; // ISO date representing start of bucket (e.g., 2025-08-01)
value: T;
}


export interface RequestBreakdownItem {
status: string;
count: number;
}


export interface RecentRequestItem {
id: string;
title: string | null;
status: string;
createdAt: string; // ISO
user: { id: string; email: string | null; name: string | null } | null;
}