import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { RevenueTargetsService } from './revenue-targets.service';
import { CreateRevenueTargetDto, UpdateRevenueTargetDto } from './dto/revenue-target.dto';

/**
 * POST   /api/revenue-targets           — create
 * GET    /api/revenue-targets           — list all
 * GET    /api/revenue-targets/current   — nearest active target (period_end >= now)
 * GET    /api/revenue-targets/:id       — get one
 * PUT    /api/revenue-targets/:id       — update
 * DELETE /api/revenue-targets/:id       — delete
 */
@ApiTags('Revenue Targets')
@ApiBearerAuth()
@Controller('revenue-targets')
export class RevenueTargetsController {
  constructor(private readonly revenueTargetsService: RevenueTargetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a revenue target for a period' })
  create(@Body() dto: CreateRevenueTargetDto) {
    return this.revenueTargetsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all revenue targets' })
  findAll() {
    return this.revenueTargetsService.findAll();
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the nearest currently-active target' })
  findCurrent() {
    return this.revenueTargetsService.findCurrent();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a revenue target by id' })
  findOne(@Param('id') id: string) {
    return this.revenueTargetsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a revenue target' })
  update(@Param('id') id: string, @Body() dto: UpdateRevenueTargetDto) {
    return this.revenueTargetsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a revenue target' })
  remove(@Param('id') id: string) {
    return this.revenueTargetsService.remove(id);
  }
}
