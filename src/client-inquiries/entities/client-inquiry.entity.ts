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

export enum InquiryProjectType {
  WEBSITE = 'website',
  WEB_APP = 'web_app',
  MOBILE_APP = 'mobile_app',
  CUSTOM_SOFTWARE = 'custom_software',
  CONSULTING = 'consulting',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export enum InquiryStatus {
  NEW = 'new',
  REVIEWING = 'reviewing',
  DISCOVERY_CALL_SCHEDULED = 'discovery_call_scheduled',
  DISCOVERY_CALL_COMPLETED = 'discovery_call_completed',
  QUOTED = 'quoted',
  PROPOSAL_SENT = 'proposal_sent',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  ON_HOLD = 'on_hold',
}

export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Matches "client_inquiries" from phase_1_agency_migration.sql.
 *
 * The table comment on the real schema is explicit:
 *   'Client project inquiries - replaces the marketplace-style requests table'
 * So this — not the old Requests module (which models a different,
 * deprecated marketplace concept) — is the real client-facing pipeline.
 *
 * project_type/status/priority are plain TEXT+CHECK columns, not native
 * Postgres enums — same treatment as elsewhere in this codebase.
 */
@Entity('client_inquiries')
export class ClientInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id' })
  @Index()
  clientId: string;

  @Column({ name: 'project_type', type: 'varchar' })
  projectType: InquiryProjectType;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ name: 'budget_range', nullable: true })
  budgetRange: string | null;

  @Column({ name: 'budget_min', type: 'numeric', nullable: true })
  budgetMin: number | null;

  @Column({ name: 'budget_max', type: 'numeric', nullable: true })
  budgetMax: number | null;

  @Column({ name: 'preferred_timeline', nullable: true })
  preferredTimeline: string | null;

  @Column({ type: 'date', nullable: true })
  deadline: string | null;

  @Column({ type: 'varchar', default: InquiryStatus.NEW })
  @Index()
  status: InquiryStatus;

  @Column({ name: 'assigned_to', nullable: true })
  @Index()
  assignedTo: string | null;

  @Column({ type: 'varchar', nullable: true })
  priority: InquiryPriority | null;

  @Column('jsonb', { default: () => "'[]'" })
  requirements: unknown[];

  @Column('jsonb', { default: () => "'[]'" })
  attachments: unknown[];

  @Column({ nullable: true })
  source: string | null;

  @Column({ name: 'viewed_by_admin_at', type: 'timestamptz', nullable: true })
  viewedByAdminAt: Date | null;

  @Column({ name: 'first_response_at', type: 'timestamptz', nullable: true })
  firstResponseAt: Date | null;

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
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User | null;
}
