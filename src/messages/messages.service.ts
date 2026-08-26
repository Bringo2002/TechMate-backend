import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /**
   * Send a message from one user to another.
   */
  async send(senderId: string, receiverId: string, content: string): Promise<Message> {
    const message = this.messageRepo.create({ senderId, receiverId, content });
    return this.messageRepo.save(message);
  }

  /**
   * Get full conversation between two users, oldest first.
   */
  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get inbox — latest message from each unique conversation partner.
   */
  async getInbox(userId: string): Promise<Message[]> {
    const messages = await this.messageRepo.find({
      where: [
        { senderId: userId },
        { receiverId: userId },
      ],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'receiver'],
    });

    // Group by conversation partner, keep only the latest message per partner
    const conversations = new Map<string, Message>();
    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, msg);
      }
    }

    return Array.from(conversations.values());
  }
}
