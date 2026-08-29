import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';
import { Environment } from '../../environments/entities/environment.entity';
import { DeploymentStage } from './deployment-stage.entity';

export enum DeploymentStatus {
  PENDING = 'pending',
  BUILDING = 'building',
  TESTING = 'testing',
  DEPLOYING = 'deploying',
  SUCCESS = 'success',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled-back',
  CANCELLED = 'cancelled',
}

export enum DeploymentCurrentStage {
  QUEUE = 'queue',
  CLONE = 'clone',
  BUILD = 'build',
  TEST = 'test',
  DEPLOY = 'deploy',
  VERIFY = 'verify',
  COMPLETE = 'complete',
}

export enum DeploymentTriggerType {
  MANUAL = 'manual',
  PUSH = 'push',
  MERGE = 'merge',
  SCHEDULE = 'schedule',
  ROLLBACK = 'rollback',
  WEBHOOK = 'webhook',
}

export enum DeploymentApprovalStatus {
  NOT_REQUIRED = 'not_required',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Matches "deployments" from deployments_migration.sql, patched by
 * deployments_v2_migration.sql (approval_status, approved_by, approved_at,
 * promoted_from_deployment_id, rollback_from_deployment_id, search_vector).
 *
 * search_vector is a Postgres tsvector maintained entirely by a DB
 * trigger (deployments_search_vector_update()) — never written to from
 * the app layer, so it isn't mapped as a column here at all; the search
 * itself is exposed via a raw call to search_deployments() in the
 * service, not reimplemented in TypeScript.
 *
 * deploy_number is a SERIAL (auto-incrementing integer), separate from
 * the UUID primary key — read-only from the app's perspective.
 */
@Entity('deployments')
export class Deployment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deploy_number', type: 'integer', insert: false, update: false })
  deployNumber: number;

  @Column({ name: 'project_id', nullable: true })
  @Index()
  projectId: string | null;

  @Column({ name: 'environment_id', nullable: true })
  @Index()
  environmentId: string | null;

  @Column({ name: 'project_name' })
  projectName: string;

  @Column({ name: 'environment_name', default: 'development' })
  environmentName: string;

  @Column({ type: 'varchar', default: DeploymentStatus.PENDING })
  @Index()
  status: DeploymentStatus;

  @Column({ default: 0 })
  progress: number;

  @Column({ name: 'current_stage', type: 'varchar', default: DeploymentCurrentStage.QUEUE })
  currentStage: DeploymentCurrentStage;

  @Column({ nullable: true })
  branch: string | null;

  @Column({ name: 'commit_hash', nullable: true })
  commitHash: string | null;

  @Column({ name: 'commit_message', nullable: true })
  commitMessage: string | null;

  @Column({ name: 'triggered_by', nullable: true })
  triggeredBy: string | null;

  @Column({ name: 'triggered_by_name', nullable: true })
  triggeredByName: string | null;

  @Column({ name: 'trigger_type', type: 'varchar', default: DeploymentTriggerType.MANUAL })
  triggerType: DeploymentTriggerType;

  /** Expected shape: { buildTime, testsPassed, testsTotal, coverage, bundleSize } */
  @Column({ name: 'build_metrics', type: 'jsonb', default: () => "'{}'" })
  buildMetrics: Record<string, unknown>;

  /** Expected shape: { performance, accessibility, bestPractices, seo } */
  @Column('jsonb', { default: () => "'{}'" })
  lighthouse: Record<string, unknown>;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ nullable: true })
  duration: number | null;

  @Column({
    name: 'approval_status',
    type: 'varchar',
    default: DeploymentApprovalStatus.NOT_REQUIRED,
  })
  approvalStatus: DeploymentApprovalStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string | null;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'promoted_from_deployment_id', nullable: true })
  promotedFromDeploymentId: string | null;

  @Column({ name: 'rollback_from_deployment_id', nullable: true })
  rollbackFromDeploymentId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;

  @ManyToOne(() => Environment, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'environment_id' })
  environment: Environment | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'triggered_by' })
  triggeredByUser: User | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @OneToMany(() => DeploymentStage, (stage) => stage.deployment)
  stages: DeploymentStage[];
}
