import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * VerificationToken entity — maps to the existing "VerificationToken" table.
 * Used for email verification flows.
 */
@Entity('VerificationToken')
export class VerificationToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * PasswordResetToken entity — maps to the existing "PasswordResetToken" table.
 * Used for password reset flows.
 */
@Entity('PasswordResetToken')
export class PasswordResetToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  token: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
