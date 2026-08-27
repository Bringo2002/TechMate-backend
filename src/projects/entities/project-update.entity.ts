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
import { Project } from './project.entity';

export enum ProjectUpdateType {
  PROGRESS = 'progress',
  MILESTONE = 'milestone',
  BLOCKER = 'blocker',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  GENERAL = 'general',
}

/**
 * Matches "project_updates" — progress log entries, optionally client-visible.
 * No updated_at in the real schema — updates are immutable once posted.
 */
@Entity('project_updates')
export class ProjectUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  @Index()
  projectId: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ name: 'update_type', type: 'varchar', nullable: true })
  updateType: ProjectUpdateType | null;

  @Column({ name: 'is_visible_to_client', default: true })
  isVisibleToClient: boolean;

  @Column('jsonb', { default: () => "'[]'" })
  attachments: unknown[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by' })
  author: User;
}
