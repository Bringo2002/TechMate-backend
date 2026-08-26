/**
 * Dashboard types — ported from the old src/types/dashboard.ts
 */
export type TimeBucket = 'day' | 'week' | 'month';

export interface OverviewStats {
  totalUsers: number;
  totalRequests: number;
  openRequests: number;
  closedRequests: number;
  totalRevenue: number;
}

export interface SeriesPoint<T = number> {
  bucket: string; // ISO date
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
  createdAt: string;
  user: { id: string; email: string | null; name: string | null } | null;
}
