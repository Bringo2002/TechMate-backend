import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto, UpdateServiceCategoryDto } from './dto/service-category.dto';

/**
 * POST   /api/service-categories         — create
 * GET    /api/service-categories         — list all
 * GET    /api/service-categories/active  — active only, ordered by sort_order
 * GET    /api/service-categories/:id     — get one
 * PUT    /api/service-categories/:id     — update
 * DELETE /api/service-categories/:id     — delete
 */
@ApiTags('Service Categories')
@ApiBearerAuth()
@Controller('service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a service category' })
  create(@Body() dto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all service categories' })
  findAll() {
    return this.serviceCategoriesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'List active service categories' })
  findActive() {
    return this.serviceCategoriesService.findActive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a service category by id' })
  findOne(@Param('id') id: string) {
    return this.serviceCategoriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service category' })
  update(@Param('id') id: string, @Body() dto: UpdateServiceCategoryDto) {
    return this.serviceCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a service category' })
  remove(@Param('id') id: string) {
    return this.serviceCategoriesService.remove(id);
  }
}
