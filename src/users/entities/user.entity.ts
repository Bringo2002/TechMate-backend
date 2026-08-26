import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../../common/enums';

/**
 * User entity — maps to the existing "User" table created by Prisma.
 *
 * Table name, column names, and enum reference all match the Prisma schema
 * exactly so we can connect to the same database without migrations.
 */
@Entity('User')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Exclude() // never serialized in API responses
  @Column()
  password: string;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ nullable: true })
  bio: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
    enumName: 'Role', // references the existing Postgres enum type
    default: Role.USER,
  })
  role: Role;

  @Column({ default: false })
  emailVerified: boolean;

  // ── Relations (added incrementally as modules are built) ──

  // Auth-related relations are defined in their own entities
  // and reference back to User via ManyToOne.
  // We use lazy strings here so the entity files don't need
  // to be imported (avoids circular deps).
}
