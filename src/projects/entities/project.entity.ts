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
import { Business } from '../../businesses/entities/business.entity';
import { ClientInquiry } from '../../client-inquiries/entities/client-inquiry.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';

/**
 * Matches the real "projects" table from production_schema.sql.
 * This is the actual product schema TechMate's frontend dashboards use —
 * NOT the old marketplace "Service" model.
 *
 * business_id, inquiry_id, and proposal_id all now have real relations —
 * every referenced module exists.
 */
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  REVIEW = 'review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
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

  @Column({ type: 'varchar', name: 'business_id', nullable: true })
  businessId: string | null;

  @Column({ type: 'varchar', name: 'inquiry_id', nullable: true })
  inquiryId: string | null;

  @Column({ type: 'varchar', name: 'proposal_id', nullable: true })
  proposalId: string | null;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  client: string | null;

  @Column({ default: 'website' })
  type: string;

  @Column({ type: 'varchar', nullable: true })
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

  /**
   * Progress percentage visible to the client — deliberately separate
   * from `progress` (internal) per the real schema's own column
   * comment: "may differ from internal progress." Added by
   * phase_1_agency_migration.sql, missed on the initial entity build
   * (which only read production_schema.sql's original CREATE TABLE,
   * not this file's later ALTER TABLE additions).
   */
  @Column({ name: 'client_visible_progress', default: 0 })
  clientVisibleProgress: number;

  @Column({ name: 'health_score', default: 100 })
  healthScore: number;

  @Column('text', { array: true, default: () => "'{}'" })
  technologies: string[];

  @Column('jsonb', { default: () => "'[]'" })
  deliverables: unknown[];

  @Column({ name: 'payment_status', type: 'varchar', default: ProjectPaymentStatus.UNPAID })
  paymentStatus: ProjectPaymentStatus;

  @Column({ type: 'varchar', name: 'technical_lead_id', nullable: true })
  technicalLeadId: string | null;

  /** Private notes not visible to client — per the real schema's column comment. */
  @Column({ type: 'varchar', name: 'internal_notes', nullable: true })
  internalNotes: string | null;

  @Column({ name: 'risk_level', type: 'varchar', nullable: true })
  riskLevel: 'low' | 'medium' | 'high' | null;

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

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'technical_lead_id' })
  technicalLead: User | null;

  @ManyToOne(() => Business, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'business_id' })
  business: Business | null;

  @ManyToOne(() => ClientInquiry, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'inquiry_id' })
  inquiry: ClientInquiry | null;

  @ManyToOne(() => Proposal, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal | null;
}
