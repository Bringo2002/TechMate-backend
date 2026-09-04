import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Deployment } from './deployment.entity';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/** Matches "deployment_approvals" from deployments_v2_migration.sql exactly. */
@Entity('deployment_approvals')
export class DeploymentApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deployment_id' })
  @Index()
  deploymentId: string;

  @Column({ type: 'varchar', name: 'requested_by', nullable: true })
  requestedBy: string | null;

  @Column({ type: 'varchar', name: 'requested_by_name', nullable: true })
  requestedByName: string | null;

  @Column({ type: 'varchar', nullable: true })
  reviewer: string | null;

  @Column({ type: 'varchar', name: 'reviewer_name', nullable: true })
  reviewerName: string | null;

  @Column({ type: 'varchar', default: ApprovalStatus.PENDING })
  @Index()
  status: ApprovalStatus;

  @Column({ type: 'varchar', nullable: true })
  notes: string | null;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'now()' })
  requestedAt: Date;

  @Column({ name: 'resolved_at', type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Deployment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deployment_id' })
  deployment: Deployment;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'requested_by' })
  requester: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewer' })
  reviewerUser: User | null;
}
