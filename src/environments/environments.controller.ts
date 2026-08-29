import { Controller, Get, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { EnvironmentsService } from './environments.service';
import { UpdateEnvironmentDto } from './dto/environment.dto';

/**
 * GET /api/environments      — list all
 * GET /api/environments/:id  — get one
 * PUT /api/environments/:id  — update
 */
@ApiTags('Environments')
@ApiBearerAuth()
@Controller('environments')
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all environments' })
  findAll() {
    return this.environmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an environment by id' })
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an environment' })
  update(@Param('id') id: string, @Body() dto: UpdateEnvironmentDto) {
    return this.environmentsService.update(id, dto);
  }
}
