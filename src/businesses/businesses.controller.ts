import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { BusinessesService } from './businesses.service';
import { CreateBusinessDto, UpdateBusinessDto } from './dto/business.dto';

/**
 * POST   /api/businesses               — create
 * GET    /api/businesses?ownerId=       — list (optional filter)
 * GET    /api/businesses/:id            — get one
 * PUT    /api/businesses/:id            — update
 * DELETE /api/businesses/:id            — soft-delete
 */
@ApiTags('Businesses')
@ApiBearerAuth()
@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a business/client company record' })
  create(@Body() dto: CreateBusinessDto) {
    return this.businessesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List businesses' })
  @ApiQuery({ name: 'ownerId', required: false })
  findAll(@Query('ownerId') ownerId?: string) {
    return this.businessesService.findAll(ownerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business by id' })
  findOne(@Param('id') id: string) {
    return this.businessesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a business' })
  update(@Param('id') id: string, @Body() dto: UpdateBusinessDto) {
    return this.businessesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a business' })
  remove(@Param('id') id: string) {
    return this.businessesService.remove(id);
  }
}
