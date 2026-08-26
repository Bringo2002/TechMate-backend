import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepo.create(dto);
    return this.serviceRepo.save(service) as Promise<Service>;
  }

  async findAll(activeOnly = true): Promise<Service[]> {
    const where = activeOnly ? { isActive: true } : {};
    return this.serviceRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepo.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.serviceRepo.save(service);
  }

  async remove(id: string): Promise<{ message: string }> {
    const service = await this.findOne(id);
    service.isActive = false;
    await this.serviceRepo.save(service);
    return { message: 'Service deactivated' };
  }
}
