import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { RevenueTarget } from './entities/revenue-target.entity';
import { CreateRevenueTargetDto, UpdateRevenueTargetDto } from './dto/revenue-target.dto';

@Injectable()
export class RevenueTargetsService {
  constructor(
    @InjectRepository(RevenueTarget)
    private readonly targetRepo: Repository<RevenueTarget>,
  ) {}

  async create(dto: CreateRevenueTargetDto): Promise<RevenueTarget> {
    const target = this.targetRepo.create(dto);
    return this.targetRepo.save(target);
  }

  async findAll(): Promise<RevenueTarget[]> {
    return this.targetRepo.find({ order: { periodStart: 'DESC' } });
  }

  async findOne(id: string): Promise<RevenueTarget> {
    const target = await this.targetRepo.findOne({ where: { id } });
    if (!target) throw new NotFoundException('Revenue target not found');
    return target;
  }

  /**
   * Matches the frontend's exact query: the nearest still-active target
   * (period_end >= now), most recent period_start first, single row.
   * No period_type filter — same as the original Supabase call.
   */
  async findCurrent(): Promise<RevenueTarget | null> {
    const [target] = await this.targetRepo.find({
      where: { periodEnd: MoreThanOrEqual(new Date()) },
      order: { periodStart: 'DESC' },
      take: 1,
    });
    return target ?? null;
  }

  async update(id: string, dto: UpdateRevenueTargetDto): Promise<RevenueTarget> {
    const target = await this.findOne(id);
    Object.assign(target, dto);
    return this.targetRepo.save(target);
  }

  /** No deleted_at on this table in the real schema — hard delete. */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id); // 404s if missing
    await this.targetRepo.delete({ id });
    return { message: 'Revenue target deleted successfully' };
  }
}
