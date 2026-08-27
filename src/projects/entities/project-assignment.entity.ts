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
import { Project } from './project.entity';

export enum AssignmentStatus {
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled',
}

export enum AssignmentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

/**
 * Matches "project_assignments" — internal task assignments, not client-visible.
 * Real schema has UNIQUE(project_id, assigned_to, role) — enforced at the
 * DB level already via the restored data; not re-declared here to avoid
 * TypeORM trying to (re)create a constraint that already exists.
 */
@Entity('project_assignments')
export class ProjectAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  @Index()
  projectId: string;

  @Column({ name: 'assigned_to' })
  @Index()
  assignedTo: string;

  @Column({ name: 'assigned_by' })
  @Index()
  assignedBy: string;

  @Column()
  role: string;

  @Column({ name: 'task_description', nullable: true })
  taskDescription: string | null;

  @Column('numeric', { name: 'hours_estimated', nullable: true })
  hoursEstimated: number | null;

  @Column('numeric', { name: 'hours_actual', default: 0 })
  hoursActual: number;

  @Column({ type: 'varchar', default: AssignmentStatus.ASSIGNED })
  @Index()
  status: AssignmentStatus;

  @Column({ type: 'varchar', nullable: true })
  priority: AssignmentPriority | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: string | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @Column({ nullable: true })
  notes: string | null;

  @Column({ name: 'blocker_description', nullable: true })
  blockerDescription: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assigned_to' })
  assignee: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'assigned_by' })
  assigner: User;
}
