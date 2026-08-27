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

/**
 * Matches "businesses" from production_schema.sql exactly — a plain table,
 * no TEXT+CHECK enums here (is_verified/is_active are real booleans).
 * owner_id references profiles(id) -> the existing User entity, same
 * pattern as Project.userId and Invoice.userId.
 */
@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_id' })
  @Index()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  industry: string | null;

  @Column({ nullable: true })
  description: string | null;

  @Column({ nullable: true })
  website: string | null;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ nullable: true })
  address: string | null;

  @Column({ nullable: true })
  city: string | null;

  @Column({ nullable: true })
  country: string | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  @Index()
  deletedAt: Date | null;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;
}
