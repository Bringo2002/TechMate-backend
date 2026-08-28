import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeveloperAllocation, AllocationStatus } from './entities/developer-allocation.entity';
import { CreateAllocationDto, UpdateAllocationDto } from './dto/team.dto';

export interface AllocationFilters {
  teamMemberId?: string;
  projectId?: string;
  status?: AllocationStatus;
}

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(DeveloperAllocation)
    private readonly allocationRepo: Repository<DeveloperAllocation>,
  ) {}

  async create(dto: CreateAllocationDto): Promise<DeveloperAllocation> {
    const allocation = this.allocationRepo.create({
      ...dto,
      status: AllocationStatus.ACTIVE,
      hoursLogged: 0,
    });
    return this.allocationRepo.save(allocation);
  }

  /** No soft delete on this table — findAll always returns all rows matching filters. */
  async findAll(filters?: AllocationFilters): Promise<DeveloperAllocation[]> {
    return this.allocationRepo.find({
      where: {
        ...(filters?.teamMemberId ? { teamMemberId: filters.teamMemberId } : {}),
        ...(filters?.projectId ? { projectId: filters.projectId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateAllocationDto): Promise<DeveloperAllocation> {
    const allocation = await this.allocationRepo.findOne({ where: { id } });
    if (!allocation) throw new NotFoundException('Allocation not found');
    Object.assign(allocation, dto);
    return this.allocationRepo.save(allocation);
  }

  /** Matches removeAllocation() — sets status to 'removed' rather than deleting the row. */
  async markRemoved(id: string): Promise<DeveloperAllocation> {
    return this.update(id, { status: AllocationStatus.REMOVED });
  }
}
