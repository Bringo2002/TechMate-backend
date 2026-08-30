import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  SYSTEM = 'system',
}

export enum ColorMode {
  VIBRANT = 'vibrant',
  MINIMAL = 'minimal',
}

export enum AiPersonality {
  CREATIVE = 'creative',
  PRECISE = 'precise',
  BALANCED = 'balanced',
}

export enum DataUsage {
  LOW = 'low',
  STANDARD = 'standard',
  HIGH = 'high',
}

/**
 * Matches "user_settings" from production_schema.sql exactly. One row
 * per user (unique user_id) — the frontend always upserts, matched by
 * an upsert-style findOrCreate in the service rather than requiring the
 * caller to know whether a row already exists.
 */
@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ type: 'varchar', default: Theme.DARK })
  theme: Theme;

  @Column({ name: 'color_mode', type: 'varchar', default: ColorMode.VIBRANT })
  colorMode: ColorMode;

  @Column({ name: 'ai_personality', type: 'varchar', default: AiPersonality.BALANCED })
  aiPersonality: AiPersonality;

  @Column({ name: 'ai_voice', default: false })
  aiVoice: boolean;

  @Column({ name: 'reduce_motion', default: false })
  reduceMotion: boolean;

  @Column({ name: 'high_contrast', default: false })
  highContrast: boolean;

  @Column({ name: 'data_usage', type: 'varchar', default: DataUsage.STANDARD })
  dataUsage: DataUsage;

  @Column({ name: 'auto_save', default: true })
  autoSave: boolean;

  @Column({ default: 'en' })
  language: string;

  @Column({ name: 'notification_email', default: true })
  notificationEmail: boolean;

  @Column({ name: 'notification_push', default: true })
  notificationPush: boolean;

  @Column({ name: 'notification_sms', default: false })
  notificationSms: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
