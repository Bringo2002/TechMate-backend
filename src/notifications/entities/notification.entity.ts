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

/**
 * NotificationChannel enum — matches existing PostgreSQL enum "NotificationChannel".
 */
export enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  TELEGRAM = 'TELEGRAM',
}

/**
 * Notification entity — maps to the existing "Notification" table.
 */
@Entity('Notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  userId: string | null;

  @Column()
  type: string; // e.g. "LOGIN_ALERT", "ACCOUNT_LOCK"

  @Column()
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
    default: NotificationChannel.IN_APP,
  })
  channel: NotificationChannel;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
