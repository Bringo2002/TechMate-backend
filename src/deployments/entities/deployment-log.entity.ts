import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Deployment } from './deployment.entity';

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  SUCCESS = 'success',
}

/**
 * Matches "deployment_logs" from deployments_v2_migration.sql exactly.
 * timestamp is its own column, separate from any createdAt convention —
 * matched as named in the schema since callers set it explicitly.
 */
@Entity('deployment_logs')
export class DeploymentLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'deployment_id' })
  @Index()
  deploymentId: string;

  @Column({ name: 'stage_name', nullable: true })
  @Index()
  stageName: string | null;

  @Column({ type: 'varchar', default: LogLevel.INFO })
  @Index()
  level: LogLevel;

  @Column()
  message: string;

  @Column({ type: 'timestamptz', default: () => 'now()' })
  @Index()
  timestamp: Date;

  @Column({ nullable: true })
  source: string | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Deployment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deployment_id' })
  deployment: Deployment;
}
