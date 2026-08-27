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

/**
 * Matches the real "projects" table from production_schema.sql.
 * This is the actual product schema TechMate's frontend dashboards use —
 * NOT the old marketplace "Service" model.
 *
 * business_id, inquiry_id, proposal_id are kept as plain UUID columns
 * (no relation yet) since Businesses/ClientInquiries/Proposals modules
 * haven't been built in this backend yet. Add the @ManyToOne once those
 * modules exist — the columns already match the restored data either way.
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  HELD = 'held',
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ProjectPaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'business_id', nullable: true })
  businessId: string | null;

  @Column({ name: 'inquiry_id', nullable: true })
  inquiryId: string | null;

  @Column({ name: 'proposal_id', nullable: true })
  proposalId: string | null;

  @Column()
  name: string;

  @Column({ nullable: true })
  client: string | null;

  @Column({ default: 'website' })
  type: string;

  @Column({ nullable: true })
  description: string | null;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  budget: number;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  spent: number;

  @Column({ name: 'deadline', type: 'timestamptz', nullable: true })
  deadline: Date | null;

  // NOTE: status/priority/payment_status are plain TEXT columns with a
  // CHECK constraint in the real schema (see production_schema.sql) —
  // not native Postgres enum types like the old Prisma tables used.
  // Declaring these as TypeORM 'enum' columns would expect an actual
  // Postgres enum type and mismatch your restored data. Validation
  // happens via the TS enum + class-validator in the DTOs instead.
  @Column({ type: 'varchar', default: ProjectStatus.PLANNING })
  @Index()
  status: ProjectStatus;

  @Column({ type: 'varchar', default: ProjectPriority.MEDIUM, nullable: true })
  priority: ProjectPriority | null;

  @Column({ default: 0 })
  progress: number;

  @Column({ name: 'health_score', default: 100 })
  healthScore: number;

  @Column('text', { array: true, default: () => "'{}'" })
  technologies: string[];

  @Column('jsonb', { default: () => "'[]'" })
  deliverables: unknown[];

  @Column({ name: 'payment_status', type: 'varchar', default: ProjectPaymentStatus.UNPAID })
  paymentStatus: ProjectPaymentStatus;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

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
}
