import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ServiceRequest, RequestStatus } from './entities/service-request.entity';
import { CreateRequestDto, UpdateRequestDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly requestRepo: Repository<ServiceRequest>,
  ) {}

  /**
   * Create a new service request — always starts as PENDING.
   */
  async create(dto: CreateRequestDto): Promise<ServiceRequest> {
    const request = this.requestRepo.create({
      ...dto,
      status: RequestStatus.PENDING,
    });
    return this.requestRepo.save(request) as Promise<ServiceRequest>;
  }

  /**
   * Get all requests, optionally filtered by userId.
   * Excludes soft-deleted records.
   */
  async findAll(userId?: string): Promise<ServiceRequest[]> {
    return this.requestRepo.find({
      where: {
        ...(userId ? { userId } : {}),
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update a request's message or status.
   */
  async update(id: string, dto: UpdateRequestDto): Promise<ServiceRequest> {
    const request = await this.requestRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    Object.assign(request, dto);
    return this.requestRepo.save(request);
  }

  /**
   * Soft-delete a request.
   */
  async remove(id: string): Promise<{ message: string }> {
    const request = await this.requestRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!request) {
      throw new NotFoundException('Request not found');
    }

    request.deletedAt = new Date();
    await this.requestRepo.save(request);
    return { message: 'Request deleted successfully' };
  }
}
