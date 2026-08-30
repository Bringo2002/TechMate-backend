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

export enum TicketCategory {
  GENERAL = 'general',
  BILLING = 'billing',
  TECHNICAL = 'technical',
  ACCOUNT = 'account',
  FEATURE_REQUEST = 'feature_request',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING = 'waiting',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/**
 * Matches "support_tickets" from production_schema.sql. Confirmed
 * against both patch files (recreate_support_tickets.sql,
 * fix_tickets.sql) — neither adds anything beyond this shape, both are
 * idempotent re-application of the same columns (debugging aids from
 * a prior migration headache, not schema changes).
 *
 * category/priority/status are plain TEXT+CHECK columns, not native
 * Postgres enums — same treatment as elsewhere in this codebase.
 */
@Entity('support_tickets')
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column()
  subject: string;

  @Column({ nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: TicketCategory.GENERAL })
  category: TicketCategory;

  @Column({ type: 'varchar', default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'varchar', default: TicketStatus.OPEN })
  @Index()
  status: TicketStatus;

  @Column({ name: 'assigned_to', nullable: true })
  @Index()
  assignedTo: string | null;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

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
  @JoinColumn({ name: 'assigned_to' })
  assignee: User | null;
}
