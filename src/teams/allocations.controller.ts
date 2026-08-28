import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AllocationsService } from './allocations.service';
import { CreateAllocationDto, UpdateAllocationDto } from './dto/team.dto';
import { AllocationStatus } from './entities/developer-allocation.entity';

/**
 * POST /api/allocations                  — create (assign a developer to a project)
 * GET  /api/allocations                  — list (filters: teamMemberId, projectId, status)
 * PUT  /api/allocations/:id               — update
 * PUT  /api/allocations/:id/remove        — convenience: sets status to 'removed'
 */
@ApiTags('Allocations')
@ApiBearerAuth()
@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Assign a developer to a project' })
  create(@Body() dto: CreateAllocationDto) {
    return this.allocationsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List allocations' })
  @ApiQuery({ name: 'teamMemberId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('teamMemberId') teamMemberId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: AllocationStatus,
  ) {
    return this.allocationsService.findAll({ teamMemberId, projectId, status });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an allocation' })
  update(@Param('id') id: string, @Body() dto: UpdateAllocationDto) {
    return this.allocationsService.update(id, dto);
  }

  @Put(':id/remove')
  @ApiOperation({ summary: "Remove a developer from a project (sets status to 'removed')" })
  markRemoved(@Param('id') id: string) {
    return this.allocationsService.markRemoved(id);
  }
}
