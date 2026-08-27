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
import { Project } from '../../projects/entities/project.entity';

export enum OrderType {
  WEBSITE = 'website',
  APP = 'app',
  CONSULTING = 'consulting',
  DESIGN = 'design',
  BACKEND = 'backend',
  FULLSTACK = 'fullstack',
}

export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum OrderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Matches "orders" from production_schema.sql. Structurally similar to
 * Project (both have budget/spent/health_score/progress) — no
 * deprecation comment on this table in the schema, unlike
 * client_inquiries/proposals, so both are treated as real, coexisting
 * concepts rather than one replacing the other. Orders appears to be
 * the client-facing "what was ordered" record; Project is the richer
 * internal work-tracking entity (business_id/inquiry_id/proposal_id/
 * assignments/updates). project_id links the two when applicable.
 *
 * type/status/priority are plain TEXT+CHECK columns, not native
 * Postgres enums — same treatment as elsewhere in this codebase.
 */
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'project_id', nullable: true })
  @Index()
  projectId: string | null;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ nullable: true })
  category: string | null;

  @Column({ type: 'varchar', default: OrderType.WEBSITE })
  type: OrderType;

  @Column({ type: 'varchar', default: OrderStatus.PENDING })
  @Index()
  status: OrderStatus;

  @Column({ default: 0 })
  progress: number;

  @Column({ type: 'varchar', default: OrderPriority.MEDIUM, nullable: true })
  priority: OrderPriority | null;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ name: 'health_score', default: 100 })
  healthScore: number;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'next_milestone', nullable: true })
  nextMilestone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;
}
