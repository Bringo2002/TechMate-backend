import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  OverviewStats,
  SeriesPoint,
  RequestBreakdownItem,
  RecentRequestItem,
  TimeBucket,
} from './types/dashboard.types';

/**
 * DashboardService — ported from the old dashboardService.ts.
 *
 * Uses raw SQL via TypeORM's DataSource.query() for the time-bucketed
 * analytics queries. These were already raw SQL in the Prisma version
 * ($queryRaw), so the port is nearly 1:1.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  private parseRange(from?: string, to?: string): { from: Date; to: Date } {
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000); // default: 30 days back
    return { from: fromDate, to: toDate };
  }

  // ──────────────────────────────────────────
  // OVERVIEW
  // ──────────────────────────────────────────
  async getOverview(fromStr?: string, toStr?: string): Promise<OverviewStats> {
    const { from, to } = this.parseRange(fromStr, toStr);

    const [users, total, open, closed, revenue] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM "User" WHERE "createdAt" <= $1`,
        [to],
      ),
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM "ServiceRequest"
         WHERE "createdAt" BETWEEN $1 AND $2 AND "deletedAt" IS NULL`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM "ServiceRequest"
         WHERE status IN ('PENDING', 'IN_PROGRESS')
         AND "createdAt" BETWEEN $1 AND $2 AND "deletedAt" IS NULL`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM "ServiceRequest"
         WHERE status IN ('COMPLETED', 'CANCELLED')
         AND "createdAt" BETWEEN $1 AND $2 AND "deletedAt" IS NULL`,
        [from, to],
      ),
      this.dataSource.query(
        `SELECT COALESCE(SUM(amount), 0)::float AS total FROM "Payment"
         WHERE "createdAt" BETWEEN $1 AND $2 AND "deletedAt" IS NULL`,
        [from, to],
      ),
    ]);

    return {
      totalUsers: users[0]?.count ?? 0,
      totalRequests: total[0]?.count ?? 0,
      openRequests: open[0]?.count ?? 0,
      closedRequests: closed[0]?.count ?? 0,
      totalRevenue: revenue[0]?.total ?? 0,
    };
  }

  // ──────────────────────────────────────────
  // USER GROWTH SERIES
  // ──────────────────────────────────────────
  async getUserGrowth(
    fromStr?: string,
    toStr?: string,
    bucket: TimeBucket = 'day',
    limit = 12,
  ): Promise<SeriesPoint[]> {
    const { from, to } = this.parseRange(fromStr, toStr);

    const rows: { bucket: Date; value: string }[] = await this.dataSource.query(
      `SELECT date_trunc($1, "createdAt") AS bucket, COUNT(*)::bigint AS value
       FROM "User"
       WHERE "createdAt" BETWEEN $2 AND $3
       GROUP BY 1 ORDER BY 1 LIMIT $4`,
      [bucket, from, to, limit],
    );

    return rows.map((r) => ({
      bucket: r.bucket.toISOString(),
      value: Number(r.value),
    }));
  }

  // ──────────────────────────────────────────
  // REVENUE SERIES
  // ──────────────────────────────────────────
  async getRevenueSeries(
    fromStr?: string,
    toStr?: string,
    bucket: TimeBucket = 'day',
    limit = 12,
  ): Promise<SeriesPoint<number>[]> {
    const { from, to } = this.parseRange(fromStr, toStr);

    const rows: { bucket: Date; value: string | null }[] = await this.dataSource.query(
      `SELECT date_trunc($1, "createdAt") AS bucket, SUM("amount") AS value
       FROM "Payment"
       WHERE "createdAt" BETWEEN $2 AND $3
       GROUP BY 1 ORDER BY 1 LIMIT $4`,
      [bucket, from, to, limit],
    );

    return rows.map((r) => ({
      bucket: r.bucket.toISOString(),
      value: Number(r.value ?? 0),
    }));
  }

  // ──────────────────────────────────────────
  // REQUEST BREAKDOWN BY STATUS
  // ──────────────────────────────────────────
  async getRequestBreakdown(
    fromStr?: string,
    toStr?: string,
  ): Promise<RequestBreakdownItem[]> {
    const { from, to } = this.parseRange(fromStr, toStr);

    const rows: { status: string; count: string }[] = await this.dataSource.query(
      `SELECT status, COUNT(*)::int AS count
       FROM "ServiceRequest"
       WHERE "createdAt" BETWEEN $1 AND $2
       GROUP BY status`,
      [from, to],
    );

    return rows.map((r) => ({ status: r.status, count: Number(r.count) }));
  }

  // ──────────────────────────────────────────
  // RECENT REQUESTS
  // ──────────────────────────────────────────
  async getRecentRequests(limit = 10): Promise<RecentRequestItem[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const rows = await this.dataSource.query(
      `SELECT sr.id, sr.status, sr."createdAt",
              u.id AS "userId", u.email, u.name,
              s.name AS "serviceName"
       FROM "ServiceRequest" sr
       LEFT JOIN "User" u ON sr."userId" = u.id
       LEFT JOIN "Service" s ON sr."serviceId" = s.id
       WHERE sr."deletedAt" IS NULL
       ORDER BY sr."createdAt" DESC
       LIMIT $1`,
      [safeLimit],
    );

    return rows.map((r: any) => ({
      id: r.id,
      title: r.serviceName ?? null,
      status: r.status,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      user: r.userId ? { id: r.userId, email: r.email, name: r.name } : null,
    }));
  }
}
