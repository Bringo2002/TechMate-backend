import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

/**
 * Services controller
 *
 * GET    /api/services       — list services (public)
 * GET    /api/services/:id   — get one service (public)
 * POST   /api/services       — create service (admin)
 * PUT    /api/services/:id   — update service (admin)
 * DELETE /api/services/:id   — deactivate service (admin)
 */
@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all active services' })
  @ApiQuery({ name: 'all', required: false, description: 'Set to "true" to include inactive' })
  async findAll(@Query('all') all?: string) {
    return this.servicesService.findAll(all !== 'true');
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a service by ID' })
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new service (admin)' })
  async create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a service (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a service (admin)' })
  async remove(@Param('id') id: string) {
    return this.servicesService.remove(id);
  }
}
