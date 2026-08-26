import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';

/**
 * NotificationsService — ported from the old notificationService.ts.
 * Sends notifications via three channels:
 *   1. IN_APP  — always (saved to DB)
 *   2. EMAIL   — if SMTP is configured and user has an email
 *   3. TELEGRAM — if bot token + chat ID are configured
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly config: ConfigService,
  ) {
    // Create SMTP transporter if credentials are present
    const smtpHost = this.config.get<string>('SMTP_HOST');
    if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: this.config.get<number>('SMTP_PORT', 587),
        secure: false,
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  /**
   * Send a notification — saves to DB, optionally emails user and posts to Telegram.
   */
  async send(
    userId: string | null,
    type: string,
    message: string,
  ): Promise<Notification> {
    // 1. Save to DB (always)
    const notification = this.notificationRepo.create({ userId, type, message });
    await this.notificationRepo.save(notification);

    // 2. Email (if user has an email and SMTP is configured)
    if (userId && this.transporter) {
      try {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user?.email) {
          await this.transporter.sendMail({
            from: `"TechMate" <${this.config.get('SMTP_USER')}>`,
            to: user.email,
            subject: `Notification: ${type}`,
            text: message,
          });
        }
      } catch (err) {
        this.logger.warn(`Failed to send email notification: ${err}`);
      }
    }

    // 3. Telegram (global ops channel)
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
    if (botToken && chatId) {
      try {
        await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          { chat_id: chatId, text: `🔔 ${type}: ${message}` },
        );
      } catch (err) {
        this.logger.warn(`Failed to send Telegram notification: ${err}`);
      }
    }

    return notification;
  }

  /**
   * Get all notifications for a user (most recent first).
   */
  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Mark a notification as read.
   */
  async markAsRead(id: string): Promise<void> {
    await this.notificationRepo.update(id, { read: true });
  }
}
