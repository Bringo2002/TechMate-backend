import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from './entities/environment.entity';
import { UpdateEnvironmentDto } from './dto/environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private readonly environmentRepo: Repository<Environment>,
  ) {}

  async findAll(): Promise<Environment[]> {
    return this.environmentRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Environment> {
    const env = await this.environmentRepo.findOne({ where: { id } });
    if (!env) throw new NotFoundException('Environment not found');
    return env;
  }

  async update(id: string, dto: UpdateEnvironmentDto): Promise<Environment> {
    const env = await this.findOne(id);
    Object.assign(env, dto);
    return this.environmentRepo.save(env);
  }
}
