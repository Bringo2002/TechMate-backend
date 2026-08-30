import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * Matches "admin_metrics" from production_schema.sql exactly — a daily
 * snapshot table (metric_date is UNIQUE), separate from the LIVE
 * get_admin_metrics() Postgres function that admin.service.ts actually
 * calls. That function computes fresh numbers from profiles/projects/
 * orders/invoices/etc. on every call; this table looks intended for a
 * scheduled job to snapshot those numbers daily for historical trend
 * charts, but no such job exists yet in this backend — flagging that
 * gap rather than inventing a cron job that wasn't asked for.
 */
@Entity('admin_metrics')
export class AdminMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'metric_date', type: 'date', unique: true })
  @Index()
  metricDate: string;

  @Column({ name: 'total_users', default: 0 })
  totalUsers: number;

  @Column({ name: 'active_users', default: 0 })
  activeUsers: number;

  @Column({ name: 'new_users', default: 0 })
  newUsers: number;

  @Column({ name: 'total_projects', default: 0 })
  totalProjects: number;

  @Column({ name: 'active_projects', default: 0 })
  activeProjects: number;

  @Column({ name: 'total_orders', default: 0 })
  totalOrders: number;

  @Column({ name: 'completed_orders', default: 0 })
  completedOrders: number;

  @Column({ name: 'total_revenue', type: 'numeric', precision: 12, scale: 2, default: 0 })
  totalRevenue: number;

  @Column({ name: 'pending_revenue', type: 'numeric', precision: 12, scale: 2, default: 0 })
  pendingRevenue: number;

  @Column({ name: 'total_requests', default: 0 })
  totalRequests: number;

  @Column({ name: 'open_requests', default: 0 })
  openRequests: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;
}
