import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SupportTicket, TicketStatus } from './entities/support-ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/support-ticket.dto';

@Injectable()
export class SupportTicketsService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepo: Repository<SupportTicket>,
  ) {}

  async create(dto: CreateTicketDto): Promise<SupportTicket> {
    const ticket = this.ticketRepo.create(dto);
    return this.ticketRepo.save(ticket);
  }

  async findByUser(userId: string): Promise<SupportTicket[]> {
    return this.ticketRepo.find({
      where: { userId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /** Admin view — all tickets, optionally filtered. */
  async findAll(status?: TicketStatus, assignedTo?: string): Promise<SupportTicket[]> {
    return this.ticketRepo.find({
      where: {
        deletedAt: IsNull(),
        ...(status ? { status } : {}),
        ...(assignedTo ? { assignedTo } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!ticket) throw new NotFoundException('Support ticket not found');
    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto): Promise<SupportTicket> {
    const ticket = await this.findOne(id);
    Object.assign(ticket, dto);
    if (dto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
      ticket.resolvedAt = new Date();
    }
    return this.ticketRepo.save(ticket);
  }

  async remove(id: string): Promise<{ message: string }> {
    const ticket = await this.findOne(id);
    ticket.deletedAt = new Date();
    await this.ticketRepo.save(ticket);
    return { message: 'Support ticket deleted successfully' };
  }
}
