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
import { Project } from '../../projects/entities/project.entity';

/**
 * Matches "messages" from production_schema.sql exactly. Previously
 * mapped to a leftover Prisma "Message" table (senderId/receiverId only,
 * no threading, no read tracking, no soft delete) — rebuilt here rather
 * than patched, same treatment Projects got.
 *
 * request_id references requests(id) in the real schema, but Requests
 * is a deprecated marketplace concept we're not building (client_inquiries
 * replaces it) — kept as a plain nullable column, no relation, same
 * treatment as other placeholder FKs pointing at modules that won't exist.
 *
 * thread_id self-references messages(id) — kept as a plain column rather
 * than a self-relation for simplicity; the service resolves threads by
 * querying on this column directly.
 */
@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sender_id' })
  @Index()
  senderId: string;

  @Column({ name: 'recipient_id' })
  @Index()
  recipientId: string;

  @Column({ type: 'varchar', nullable: true })
  subject: string | null;

  @Column()
  content: string;

  @Column({ type: 'varchar', name: 'thread_id', nullable: true })
  @Index()
  threadId: string | null;

  @Column({ type: 'varchar', name: 'request_id', nullable: true })
  requestId: string | null;

  @Column({ type: 'varchar', name: 'project_id', nullable: true })
  projectId: string | null;

  @Column({ name: 'is_read', default: false })
  @Index()
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @Column('jsonb', { default: () => "'[]'" })
  attachments: unknown[];

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
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @ManyToOne(() => Project, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project | null;
}
