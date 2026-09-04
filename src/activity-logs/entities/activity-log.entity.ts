import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Matches "activity_logs" from production_schema.sql exactly — an
 * append-only audit trail. No updated_at, no deleted_at, no update or
 * delete operations in the service below by design; entries are
 * immutable once written.
 *
 * ip_address uses Postgres's native `inet` type.
 */
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'user_id', nullable: true })
  @Index()
  userId: string | null;

  @Column({ name: 'entity_type' })
  @Index()
  entityType: string;

  @Column({ type: 'varchar', name: 'entity_id', nullable: true })
  @Index()
  entityId: string | null;

  @Column()
  action: string;

  @Column('jsonb', { default: () => "'{}'" })
  changes: Record<string, unknown>;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', name: 'user_agent', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
