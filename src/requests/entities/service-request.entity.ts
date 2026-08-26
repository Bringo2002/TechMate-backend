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
 * RequestStatus enum — matches the existing PostgreSQL enum type "RequestStatus".
 */
export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS',
}

/**
 * ServiceRequest entity — maps to the existing "ServiceRequest" table.
 * Represents a client's request for a service.
 */
@Entity('ServiceRequest')
export class ServiceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  @Index()
  serviceId: string;

  @Column({ nullable: true })
  message: string | null;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    enumName: 'RequestStatus',
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Note: Service entity relation will be added when the Service module is built.
  // For now, serviceId is stored as a plain UUID column.
}
