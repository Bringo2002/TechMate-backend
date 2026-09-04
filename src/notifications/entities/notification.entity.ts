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

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Matches "notifications" from production_schema.sql exactly. Previously
 * mapped to a leftover Prisma "Notification" table with a different,
 * narrower shape — rebuilt here rather than patched, same treatment
 * Projects got.
 *
 * Note what the real schema does NOT have: no updated_at, no deleted_at.
 * Notifications are immutable once created (aside from is_read/read_at)
 * and hard-deleted, not soft-deleted — matched exactly, not "improved"
 * with columns the restored schema doesn't define.
 *
 * type is a plain TEXT+CHECK column, not a native Postgres enum — same
 * treatment as elsewhere in this codebase.
 */
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'varchar', nullable: true })
  message: string | null;

  @Column({ type: 'varchar', default: NotificationType.INFO })
  type: NotificationType;

  @Column({ type: 'varchar', nullable: true })
  category: string | null;

  @Column({ type: 'varchar', nullable: true })
  link: string | null;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('jsonb', { default: () => "'{}'" })
  metadata: Record<string, unknown>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
