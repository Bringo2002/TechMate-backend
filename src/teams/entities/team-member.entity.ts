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

export enum TeamMemberRole {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  TECH_LEAD = 'tech_lead',
  DEVOPS = 'devops',
  QA = 'qa',
  PM = 'pm',
}

export enum TeamDepartment {
  ENGINEERING = 'engineering',
  DESIGN = 'design',
  QA = 'qa',
  DEVOPS = 'devops',
  MANAGEMENT = 'management',
}

export enum Seniority {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  LEAD = 'lead',
  PRINCIPAL = 'principal',
}

export enum TeamMemberStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  INACTIVE = 'inactive',
}

/**
 * Matches "team_members" from team_tables.sql exactly. profile_id is
 * optional — a team member doesn't necessarily have a login (matches
 * the schema's ON DELETE SET NULL, nullable FK).
 *
 * role/department/seniority/status are plain TEXT (+ CHECK on status
 * only) columns in the real schema, not native Postgres enums — same
 * treatment as elsewhere in this codebase.
 */
@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'profile_id', nullable: true })
  profileId: string | null;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', default: TeamMemberRole.DEVELOPER })
  @Index()
  role: TeamMemberRole;

  @Column({ type: 'varchar', default: TeamDepartment.ENGINEERING, nullable: true })
  @Index()
  department: TeamDepartment | null;

  @Column({ type: 'varchar', default: Seniority.MID, nullable: true })
  seniority: Seniority | null;

  @Column('text', { array: true, default: () => "'{}'" })
  skills: string[];

  @Column({ name: 'hourly_rate', type: 'numeric', precision: 10, scale: 2, default: 0 })
  hourlyRate: number;

  @Column({ default: 40 })
  availability: number;

  @Column({ type: 'varchar', default: TeamMemberStatus.ACTIVE })
  @Index()
  status: TeamMemberStatus;

  @Column({ name: 'joined_at', type: 'timestamptz', nullable: true })
  joinedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'profile_id' })
  profile: User | null;
}
