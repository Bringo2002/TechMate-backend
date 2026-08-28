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
import { TeamMember } from './team-member.entity';
import { Project } from '../../projects/entities/project.entity';

export enum ProjectRoleOnProject {
  DEVELOPER = 'developer',
  LEAD = 'lead',
  REVIEWER = 'reviewer',
  DESIGNER = 'designer',
  QA = 'qa',
}

export enum AllocationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  REMOVED = 'removed',
}

/**
 * Matches "developer_allocations" from team_tables.sql exactly — links a
 * TeamMember to a Project with time tracking. No soft delete in the real
 * schema (removal is modeled as status='removed', not deleted_at) —
 * matched exactly rather than adding a column the schema doesn't have.
 */
@Entity('developer_allocations')
export class DeveloperAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_member_id' })
  @Index()
  teamMemberId: string;

  @Column({ name: 'project_id' })
  @Index()
  projectId: string;

  @Column({ name: 'role_on_project', type: 'varchar', default: ProjectRoleOnProject.DEVELOPER })
  roleOnProject: ProjectRoleOnProject;

  @Column({ name: 'allocation_pct', default: 100 })
  allocationPct: number;

  @Column({ name: 'hours_estimated', type: 'numeric', precision: 8, scale: 1, default: 0 })
  hoursEstimated: number;

  @Column({ name: 'hours_logged', type: 'numeric', precision: 8, scale: 1, default: 0 })
  hoursLogged: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', default: AllocationStatus.ACTIVE })
  @Index()
  status: AllocationStatus;

  @Column({ nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => TeamMember, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_member_id' })
  teamMember: TeamMember;

  @ManyToOne(() => Project, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;
}
