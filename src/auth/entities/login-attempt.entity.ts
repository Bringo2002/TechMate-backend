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
 * LoginAttempt entity — maps to the existing "LoginAttempt" table.
 * Records every login attempt for IP-based and account-based rate limiting.
 *
 * Note: Prisma used @default(cuid()) for the ID — TypeORM doesn't have
 * built-in CUID, so we use UUID instead. Both are unique string IDs,
 * and existing CUID rows will coexist fine with new UUID rows.
 */
@Entity('LoginAttempt')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  userId: string | null;

  @Column()
  ip: string;

  @Column({ nullable: true })
  @Index()
  email: string | null;

  @Column()
  success: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User | null;
}
