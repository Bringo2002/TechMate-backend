import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestDto } from './dto/request.dto';

/**
 * Requests controller — service request CRUD
 *
 * POST   /api/requests       — create a request
 * GET    /api/requests       — list requests (optional ?userId= filter)
 * PUT    /api/requests/:id   — update request
 * DELETE /api/requests/:id   — soft-delete request
 */
@ApiTags('Requests')
@ApiBearerAuth()
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service request' })
  async create(@Body() dto: CreateRequestDto) {
    return this.requestsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List service requests' })
  @ApiQuery({ name: 'userId', required: false })
  async findAll(@Query('userId') userId?: string) {
    return this.requestsService.findAll(userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a service request' })
  async update(@Param('id') id: string, @Body() dto: UpdateRequestDto) {
    return this.requestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a service request' })
  async remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
