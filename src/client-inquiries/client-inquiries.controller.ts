import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ClientInquiriesService } from './client-inquiries.service';
import { CreateInquiryDto, UpdateInquiryDto, AssignInquiryDto } from './dto/client-inquiry.dto';
import { InquiryStatus } from './entities/client-inquiry.entity';

/**
 * POST   /api/inquiries                        — create
 * GET    /api/inquiries                         — admin list (filters: status, assignedTo, priority, projectType)
 * GET    /api/inquiries/stats?userId=           — pipeline stats (omit userId for admin view)
 * GET    /api/inquiries/client/:clientId        — a client's own inquiries
 * GET    /api/inquiries/:id                     — get one (with client + assignee)
 * PUT    /api/inquiries/:id                     — update
 * PUT    /api/inquiries/:id/status              — change status
 * POST   /api/inquiries/:id/assign              — assign to a team member
 * POST   /api/inquiries/:id/unassign            — unassign
 * DELETE /api/inquiries/:id                     — soft-delete
 */
@ApiTags('Client Inquiries')
@ApiBearerAuth()
@Controller('inquiries')
export class ClientInquiriesController {
  constructor(private readonly inquiriesService: ClientInquiriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a client inquiry' })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List inquiries (admin pipeline view)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'projectType', required: false })
  findAll(
    @Query('status') status?: InquiryStatus,
    @Query('assignedTo') assignedTo?: string,
    @Query('priority') priority?: string,
    @Query('projectType') projectType?: string,
  ) {
    return this.inquiriesService.findAll({ status, assignedTo, priority, projectType });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Pipeline stats — admin view if userId omitted, client view otherwise' })
  @ApiQuery({ name: 'userId', required: false })
  getStats(@Query('userId') userId?: string) {
    return this.inquiriesService.getStats(userId);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: "A specific client's own inquiries" })
  findByClient(@Param('clientId') clientId: string) {
    return this.inquiriesService.findByClient(clientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inquiry by id' })
  findOne(@Param('id') id: string) {
    return this.inquiriesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an inquiry' })
  update(@Param('id') id: string, @Body() dto: UpdateInquiryDto) {
    return this.inquiriesService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change inquiry status' })
  updateStatus(@Param('id') id: string, @Body('status') status: InquiryStatus) {
    return this.inquiriesService.updateStatus(id, status);
  }

  @Post(':id/assign')
  @ApiOperation({ summary: 'Assign inquiry to a team member' })
  assign(@Param('id') id: string, @Body() dto: AssignInquiryDto) {
    return this.inquiriesService.assign(id, dto.userId);
  }

  @Post(':id/unassign')
  @ApiOperation({ summary: 'Unassign inquiry' })
  unassign(@Param('id') id: string) {
    return this.inquiriesService.unassign(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an inquiry' })
  remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
