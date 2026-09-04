import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum RevenueTargetPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

/**
 * Matches "revenue_targets" from revenue_dashboard_migration.sql exactly.
 * The unique constraint (period_type, period_start) is enforced at the
 * DB level on the restored schema — not re-declared here (same approach
 * used for ProjectAssignment's UNIQUE constraint), to avoid TypeORM
 * trying to (re)create a constraint that already exists.
 *
 * period_type is a plain TEXT+CHECK column, not a native Postgres enum —
 * same treatment as elsewhere in this codebase.
 */
@Entity('revenue_targets')
export class RevenueTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'period_type', type: 'varchar', default: RevenueTargetPeriod.MONTH })
  @Index()
  periodType: RevenueTargetPeriod;

  @Column({ name: 'period_start', type: 'timestamptz' })
  @Index()
  periodStart: Date;

  @Column({ name: 'period_end', type: 'timestamptz' })
  @Index()
  periodEnd: Date;

  @Column({ name: 'target_amount', type: 'numeric', precision: 14, scale: 2, default: 0 })
  targetAmount: number;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', name: 'created_by', nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User | null;
}
