import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceCategory } from './entities/service-category.entity';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './dto/service-category.dto';

@Injectable()
export class ServiceCategoriesService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
  ) {}

  async create(dto: CreateServiceCategoryDto): Promise<ServiceCategory> {
    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  async findAll(): Promise<ServiceCategory[]> {
    return this.categoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  /** Matches the frontend's `.eq('is_active', true)` filter used in revenue.service.ts. */
  async findActive(): Promise<ServiceCategory[]> {
    return this.categoryRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ServiceCategory> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Service category not found');
    return category;
  }

  async update(id: string, dto: UpdateServiceCategoryDto): Promise<ServiceCategory> {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  /** No deleted_at on this table — hard delete. */
  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.categoryRepo.delete({ id });
    return { message: 'Service category deleted successfully' };
  }
}
