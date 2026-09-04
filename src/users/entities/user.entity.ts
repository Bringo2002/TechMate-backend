import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums';

/**
 * User entity — rebuilt to match the real "profiles" table from
 * production_schema.sql, since we're starting fresh with no data to
 * preserve (there is no more auth.users to satisfy profiles' original
 * FK; this entity now owns auth directly instead of extending Supabase).
 *
 * Previously mapped to a leftover Prisma "User" table from the
 * abandoned marketplace backend (name/email/password/avatarUrl/bio
 * only) -- every other real module (Projects, Invoices, Businesses)
 * expects a "profiles"-shaped user, so this replaces that entirely
 * rather than living alongside it as a second, redundant user table.
 *
 * role/user_type are plain TEXT+CHECK columns in the real schema, not
 * native Postgres enums -- same treatment as status/priority elsewhere.
 */
export enum UserType {
  INDIVIDUAL = 'individual',
  BUSINESS_OWNER = 'business_owner',
  DEVELOPER = 'developer',
  ADMIN = 'admin',
}

@Entity('profiles')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  email: string;

  @Exclude() // never serialized in API responses
  @Column()
  password: string;

  @Column({ type: 'varchar', name: 'full_name', nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', name: 'avatar_url', nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  bio: string | null;

  @Column({ type: 'varchar', nullable: true })
  company: string | null;

  @Column({ type: 'varchar', name: 'job_title', nullable: true })
  jobTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ type: 'varchar', nullable: true })
  website: string | null;

  @Column({ default: 'UTC' })
  timezone: string;

  // Plain TEXT + CHECK in the real schema, not a native Postgres enum.
  @Column({ type: 'varchar', default: Role.USER })
  @Index()
  role: Role;

  @Column({ name: 'user_type', type: 'varchar', default: UserType.INDIVIDUAL })
  userType: UserType;

  @Column({ name: 'is_admin', default: false })
  isAdmin: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  // ── Relations (added incrementally as modules are built) ──

  // Auth-related relations are defined in their own entities
  // and reference back to User via ManyToOne.
  // We use lazy strings here so the entity files don't need
  // to be imported (avoids circular deps).
}
