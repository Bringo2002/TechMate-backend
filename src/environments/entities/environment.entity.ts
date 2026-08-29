import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum EnvironmentType {
  PRODUCTION = 'production',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
  PREVIEW = 'preview',
}

export enum EnvironmentStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
  DEPLOYING = 'deploying',
}

/** Matches "environments" from deployments_migration.sql exactly. */
@Entity('environments')
export class Environment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', default: EnvironmentType.DEVELOPMENT })
  @Index()
  type: EnvironmentType;

  @Column({ type: 'varchar', default: EnvironmentStatus.HEALTHY })
  @Index()
  status: EnvironmentStatus;

  @Column({ nullable: true })
  version: string | null;

  @Column({ nullable: true })
  url: string | null;

  @Column({ default: 'us-east-1' })
  region: string;

  @Column('numeric', { precision: 5, scale: 2, default: 100.0 })
  uptime: number;

  @Column({ name: 'response_time', default: 0 })
  responseTime: number;

  @Column({ name: 'error_rate', type: 'numeric', precision: 5, scale: 2, default: 0 })
  errorRate: number;

  @Column({ default: 0 })
  traffic: number;

  @Column({ default: 1 })
  instances: number;

  @Column({ name: 'last_deployed_at', type: 'timestamptz', nullable: true })
  lastDeployedAt: Date | null;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;
}
