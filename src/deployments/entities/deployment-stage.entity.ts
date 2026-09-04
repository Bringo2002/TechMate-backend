import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Deployment } from './deployment.entity';

export enum StageStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

/** Matches "deployment_stages" from deployments_migration.sql exactly. */
@Entity('deployment_stages')
export class DeploymentStage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deployment_id' })
  @Index()
  deploymentId: string;

  @Column()
  name: string;

  @Column({ name: 'stage_order', default: 0 })
  stageOrder: number;

  @Column({ type: 'varchar', default: StageStatus.PENDING })
  status: StageStatus;

  @Column({ type: 'integer', nullable: true })
  duration: number | null;

  @Column('text', { array: true, nullable: true })
  logs: string[] | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Deployment, (deployment) => deployment.stages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deployment_id' })
  deployment: Deployment;
}
