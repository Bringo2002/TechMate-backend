import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ClientInquiry, InquiryStatus } from './entities/client-inquiry.entity';
import { CreateInquiryDto, UpdateInquiryDto } from './dto/client-inquiry.dto';

export interface InquiryFilters {
  status?: InquiryStatus;
  assignedTo?: string;
  priority?: string;
  projectType?: string;
}

@Injectable()
export class ClientInquiriesService {
  constructor(
    @InjectRepository(ClientInquiry)
    private readonly inquiryRepo: Repository<ClientInquiry>,
  ) {}

  async create(dto: CreateInquiryDto): Promise<ClientInquiry> {
    const inquiry = this.inquiryRepo.create(dto);
    return this.inquiryRepo.save(inquiry);
  }

  /** Admin view, with optional filters — mirrors the frontend's getInquiries(). */
  async findAll(filters?: InquiryFilters): Promise<ClientInquiry[]> {
    return this.inquiryRepo.find({
      where: {
        deletedAt: IsNull(),
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.assignedTo ? { assignedTo: filters.assignedTo } : {}),
        ...(filters?.priority ? { priority: filters.priority as any } : {}),
        ...(filters?.projectType ? { projectType: filters.projectType as any } : {}),
      },
      relations: ['client', 'assignee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ClientInquiry> {
    const inquiry = await this.inquiryRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['client', 'assignee'],
    });
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  /** Mirrors the frontend's getClientInquiries(clientId) — client's own view. */
  async findByClient(clientId: string): Promise<ClientInquiry[]> {
    return this.inquiryRepo.find({
      where: { clientId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateInquiryDto): Promise<ClientInquiry> {
    const inquiry = await this.findOne(id);
    Object.assign(inquiry, dto);
    await this.inquiryRepo.save(inquiry);
    return this.findOne(id);
  }

  /**
   * Mirrors updateInquiryStatus(): moving into 'reviewing' also stamps
   * viewed_by_admin_at the first time, same as the frontend's side effect.
   */
  async updateStatus(id: string, status: InquiryStatus): Promise<ClientInquiry> {
    const inquiry = await this.findOne(id);
    inquiry.status = status;
    if (status === InquiryStatus.REVIEWING && !inquiry.viewedByAdminAt) {
      inquiry.viewedByAdminAt = new Date();
    }
    await this.inquiryRepo.save(inquiry);
    return this.findOne(id);
  }

  /**
   * Mirrors assignInquiry(): also stamps first_response_at the first time,
   * same as the frontend's side effect.
   */
  async assign(id: string, userId: string): Promise<ClientInquiry> {
    const inquiry = await this.findOne(id);
    inquiry.assignedTo = userId;
    if (!inquiry.firstResponseAt) {
      inquiry.firstResponseAt = new Date();
    }
    await this.inquiryRepo.save(inquiry);
    return this.findOne(id);
  }

  async unassign(id: string): Promise<ClientInquiry> {
    const inquiry = await this.findOne(id);
    inquiry.assignedTo = null;
    await this.inquiryRepo.save(inquiry);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const inquiry = await this.findOne(id);
    inquiry.deletedAt = new Date();
    await this.inquiryRepo.save(inquiry);
    return { message: 'Inquiry deleted successfully' };
  }

  /**
   * Calls the real get_inquiry_stats(p_user_id) Postgres function directly —
   * it already exists in phase_1_agency_migration.sql and returns exactly
   * the JSONB shape the frontend expects, so this reuses it rather than
   * reimplementing the same aggregation twice.
   */
  async getStats(userId?: string): Promise<Record<string, unknown>> {
    const result = await this.inquiryRepo.manager.query(
      'SELECT get_inquiry_stats($1) AS stats',
      [userId ?? null],
    );
    return result?.[0]?.stats ?? {};
  }
}
