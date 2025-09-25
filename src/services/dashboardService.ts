// ======================================
// FILE: src/services/dashboardService.ts
// ======================================
import prisma from "../prismaClient.js";
import { OverviewStats, SeriesPoint, RequestBreakdownItem, RecentRequestItem, TimeBucket } from "../types/dashboard.js";


export async function getOverview(from: Date, to: Date): Promise<OverviewStats> {
const [totalUsers, totalRequests, openRequests, closedRequests, revenueAgg] = await Promise.all([
prisma.user.count({ where: { createdAt: { lte: to } } }),
prisma.serviceRequest.count({
     where: { createdAt: { gte: from, lte: to }, deletedAt: null } }),
prisma.serviceRequest.count({
     where: { status: { in: ["PENDING", "IN_PROGRESS"] }, createdAt: { gte: from, lte: to }, deletedAt: null } }),
prisma.serviceRequest.count({
     where: { status: { in: ["COMPLETED", "CANCELLED"] }, createdAt: { gte: from, lte: to }, deletedAt: null } }),
prisma.payment.aggregate({
     where: { createdAt: { gte: from, lte: to }, deletedAt: null }, _sum: { amount: true } }),
]);


return {
totalUsers,
totalRequests,
openRequests,
closedRequests,
totalRevenue: Number(revenueAgg._sum.amount ?? 0),
};
}


// --- Time bucketing helpers (Postgres) ---
function bucketToTrunc(bucket: TimeBucket) {
switch (bucket) {
case "day":
return "day";
case "week":
return "week";
case "month":
return "month";
}
}


export async function getUserGrowth(from: Date, to: Date, bucket: TimeBucket, limit: number): Promise<SeriesPoint[]> {
// Uses Postgres date_trunc for efficient server-side bucketing
const trunc = bucketToTrunc(bucket);
const rows: Array<{ bucket: Date; value: bigint }> = await prisma.$queryRaw`
SELECT date_trunc(${trunc}, "createdAt") AS bucket, COUNT(*)::bigint AS value
FROM "User"
WHERE "createdAt" BETWEEN ${from} AND ${to}
GROUP BY 1
ORDER BY 1
LIMIT ${limit}
`;


return rows.map((r) => ({ bucket: r.bucket.toISOString(), value: Number(r.value) }));
}


export async function getRevenueSeries(from: Date, to: Date, bucket: TimeBucket, limit: number): Promise<SeriesPoint<number>[]> {
const trunc = bucketToTrunc(bucket);
const rows: Array<{ bucket: Date; value: number | null }> = await prisma.$queryRaw`
SELECT date_trunc(${trunc}, "createdAt") AS bucket, SUM("amount") AS value
FROM "Payment"
WHERE "createdAt" BETWEEN ${from} AND ${to}
GROUP BY 1
ORDER BY 1
LIMIT ${limit}
`;
return rows.map((r) => ({ bucket: r.bucket.toISOString(), value: Number(r.value ?? 0) }));
}


export async function getRequestBreakdown(from: Date, to: Date): Promise<RequestBreakdownItem[]> {
const rows = await prisma.serviceRequest.groupBy({
by: ["status"],
where: { createdAt: { gte: from, lte: to } },
_count: { _all: true },
});
return rows.map((r) => ({ status: r.status as string, count: r._count._all }));
}


export async function getRecentRequests(limit: number): Promise<RecentRequestItem[]> {
const items = await prisma.serviceRequest.findMany({
where: { deletedAt: null },
orderBy: { createdAt: "desc" },
take: Math.min(Math.max(limit, 1), 50),
select: {
id: true,
status: true,
createdAt: true,
user: { select: { id: true, email: true, name: true } },
service: { select: { name: true } },
},
});


return items.map((i) => ({
id: i.id,
title: i.service.name ?? "",
status: i.status as string,
createdAt: i.createdAt.toISOString(),
user: i.user ? { id: i.user.id, email: i.user.email, name: i.user.name } : null,
}));
}