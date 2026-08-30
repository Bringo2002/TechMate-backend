import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { SupportTicketsService } from './support-tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/support-ticket.dto';
import { TicketStatus } from './entities/support-ticket.entity';

/**
 * POST   /api/support-tickets                          — create
 * GET    /api/support-tickets?status=&assignedTo=       — admin list (filters)
 * GET    /api/support-tickets/user/:userId              — a user's own tickets
 * GET    /api/support-tickets/:id                       — get one
 * PUT    /api/support-tickets/:id                       — update
 * DELETE /api/support-tickets/:id                       — soft-delete
 */
@ApiTags('Support Tickets')
@ApiBearerAuth()
@Controller('support-tickets')
export class SupportTicketsController {
  constructor(private readonly supportTicketsService: SupportTicketsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  create(@Body() dto: CreateTicketDto) {
    return this.supportTicketsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tickets (admin view, optional filters)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  findAll(@Query('status') status?: TicketStatus, @Query('assignedTo') assignedTo?: string) {
    return this.supportTicketsService.findAll(status, assignedTo);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "A specific user's own tickets" })
  findByUser(@Param('userId') userId: string) {
    return this.supportTicketsService.findByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a ticket by id' })
  findOne(@Param('id') id: string) {
    return this.supportTicketsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a ticket' })
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.supportTicketsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a ticket' })
  remove(@Param('id') id: string) {
    return this.supportTicketsService.remove(id);
  }
}
