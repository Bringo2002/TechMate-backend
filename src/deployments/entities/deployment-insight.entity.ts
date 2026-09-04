import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Deployment } from './deployment.entity';

export enum InsightType {
  PREDICTION = 'prediction',
  OPTIMIZATION = 'optimization',
  ALERT = 'alert',
  RECOMMENDATION = 'recommendation',
}

export enum InsightPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/** Matches "deployment_insights" from deployments_migration.sql exactly. */
@Entity('deployment_insights')
export class DeploymentInsight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'deployment_id', nullable: true })
  @Index()
  deploymentId: string | null;

  @Column({ type: 'varchar', default: InsightType.RECOMMENDATION })
  type: InsightType;

  @Column({ type: 'varchar', default: InsightPriority.MEDIUM })
  priority: InsightPriority;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  impact: string | null;

  @Column({ default: 50 })
  confidence: number;

  @Column({ type: 'varchar', name: 'action_label', nullable: true })
  actionLabel: string | null;

  @Column({ name: 'is_dismissed', default: false })
  @Index()
  isDismissed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Deployment, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'deployment_id' })
  deployment: Deployment | null;
}
