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

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Matches "invoices" from production_schema.sql (as patched by fix_invoices.sql
 * — that patch is already reflected here, nothing further needed for those columns).
 *
 * total_amount is `GENERATED ALWAYS AS (amount + tax_amount) STORED` in Postgres —
 * marked insert:false/update:false so TypeORM never tries to write it, only reads
 * whatever Postgres computes.
 *
 * order_id is a plain nullable UUID column (no relation) — Orders module isn't
 * built yet (next phase). project_id and user_id DO get real relations since
 * Projects and Users already exist in this backend.
 */
@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'order_id', nullable: true })
  orderId: string | null;

  @Column({ name: 'project_id', nullable: true })
  @Index()
  projectId: string | null;

  @Column('numeric', { precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    insert: false,
    update: false,
  })
  totalAmount: number;

  @Column({ default: 'USD' })
  currency: string;

  // Plain TEXT + CHECK in the real schema, not a native Postgres enum — see
  // the same note on the Project entity.
  @Column({ type: 'varchar', default: InvoiceStatus.DRAFT })
  @Index()
  status: InvoiceStatus;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ name: 'sent_date', type: 'timestamptz', nullable: true })
  sentDate: Date | null;

  @Column({ name: 'paid_date', type: 'timestamptz', nullable: true })
  paidDate: Date | null;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string | null;

  @Column({ name: 'payment_reference', nullable: true })
  paymentReference: string | null;

  @Column({ nullable: true })
  notes: string | null;

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
