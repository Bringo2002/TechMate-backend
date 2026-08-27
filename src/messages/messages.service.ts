import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/message.dto';

export interface ConversationSummary {
  contactId: string;
  contactName: string;
  contactAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async send(senderId: string, dto: SendMessageDto): Promise<Message> {
    const message = this.messageRepo.create({ senderId, ...dto });
    const saved = await this.messageRepo.save(message);
    const withRelations = await this.messageRepo.findOne({
      where: { id: saved.id },
      relations: ['sender', 'recipient'],
    });
    return withRelations!;
  }

  /** Full thread between two users, oldest first. */
  async getConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: [
        { senderId: userId, recipientId: otherUserId, deletedAt: IsNull() },
        { senderId: otherUserId, recipientId: userId, deletedAt: IsNull() },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Inbox — latest message per conversation partner, plus per-partner
   * unread count. Returns the same shape the frontend's ConversationSummary
   * expects directly, rather than making the frontend guess at fields
   * (the previous wrong-schema version returned raw Message[] with
   * relations, and the frontend's mapping referenced fields — otherUser,
   * unreadCount — that were never actually present in that response).
   *
   * Note on approach: this does one unread-count query per conversation
   * partner rather than a single grouped query. Fine at this data volume;
   * worth revisiting with a windowed/grouped SQL query if the number of
   * conversations per user grows large enough for this to matter.
   */
  async getInbox(userId: string): Promise<ConversationSummary[]> {
    const messages = await this.messageRepo.find({
      where: [
        { senderId: userId, deletedAt: IsNull() },
        { recipientId: userId, deletedAt: IsNull() },
      ],
      order: { createdAt: 'DESC' },
      relations: ['sender', 'recipient'],
    });

    const latestByPartner = new Map<string, Message>();
    for (const msg of messages) {
      const isSender = msg.senderId === userId;
      const partnerId = isSender ? msg.recipientId : msg.senderId;
      if (!latestByPartner.has(partnerId)) {
        latestByPartner.set(partnerId, msg);
      }
    }

    const summaries: ConversationSummary[] = [];
    for (const [partnerId, msg] of latestByPartner) {
      const partner = msg.senderId === partnerId ? msg.sender : msg.recipient;
      const unreadCount = await this.messageRepo.count({
        where: { senderId: partnerId, recipientId: userId, isRead: false, deletedAt: IsNull() },
      });
      summaries.push({
        contactId: partnerId,
        contactName: partner?.fullName ?? 'User',
        contactAvatar: partner?.avatarUrl ?? null,
        lastMessage: msg.content,
        lastMessageTime: msg.createdAt.toISOString(),
        unreadCount,
      });
    }

    return summaries;
  }

  /** Marks every unread message FROM contactId TO userId as read. */
  async markConversationRead(userId: string, contactId: string): Promise<{ updated: number }> {
    const result = await this.messageRepo.update(
      { senderId: contactId, recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    return { updated: result.affected ?? 0 };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepo.count({
      where: { recipientId: userId, isRead: false, deletedAt: IsNull() },
    });
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const message = await this.messageRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      // Only the sender can delete their own message — recipients keep
      // their copy of the conversation, matching how the frontend's
      // deleteMessage was scoped to a single messageId with no
      // additional confirmation of ownership. Enforcing it here instead.
      throw new NotFoundException('Message not found');
    }
    message.deletedAt = new Date();
    await this.messageRepo.save(message);
    return { message: 'Message deleted successfully' };
  }
}
