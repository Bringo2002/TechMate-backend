import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { CreateActivityLogDto } from './dto/activity-log.dto';

export interface ActivityLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
}

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly logRepo: Repository<ActivityLog>,
  ) {}

  /**
   * ipAddress/userAgent are captured server-side from the request rather
   * than trusted from the client body — a client claiming its own IP is
   * meaningless for an audit trail. The original frontend call never sent
   * these either; this is a deliberate improvement, not a schema mismatch.
   */
  async create(
    dto: CreateActivityLogDto,
    ipAddress?: string | null,
    userAgent?: string | null,
  ): Promise<ActivityLog> {
    const log = this.logRepo.create({ ...dto, ipAddress: ipAddress ?? null, userAgent: userAgent ?? null });
    return this.logRepo.save(log);
  }

  /** Append-only audit trail — no update/delete operations by design. */
  async findAll(filters?: ActivityLogFilters): Promise<ActivityLog[]> {
    return this.logRepo.find({
      where: {
        ...(filters?.userId ? { userId: filters.userId } : {}),
        ...(filters?.entityType ? { entityType: filters.entityType } : {}),
        ...(filters?.entityId ? { entityId: filters.entityId } : {}),
      },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<ActivityLog[]> {
    return this.logRepo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
