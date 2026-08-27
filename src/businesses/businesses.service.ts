import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
  ) {}

  async create(dto: CreateBusinessDto): Promise<Business> {
    const business = this.businessRepo.create(dto);
    return this.businessRepo.save(business);
  }

  async findAll(ownerId?: string): Promise<Business[]> {
    return this.businessRepo.find({
      where: { ...(ownerId ? { ownerId } : {}), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Business> {
    const business = await this.businessRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!business) throw new NotFoundException('Business not found');
    return business;
  }

  async update(id: string, dto: UpdateBusinessDto): Promise<Business> {
    const business = await this.findOne(id);
    Object.assign(business, dto);
    return this.businessRepo.save(business);
  }

  async remove(id: string): Promise<{ message: string }> {
    const business = await this.findOne(id);
    business.deletedAt = new Date();
    await this.businessRepo.save(business);
    return { message: 'Business deleted successfully' };
  }
}
