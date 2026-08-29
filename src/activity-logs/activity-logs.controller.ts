import { Controller, Get, Post, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/activity-log.dto';

/**
 * POST /api/activity-logs                                — log an action
 * GET  /api/activity-logs?userId=&entityType=&entityId=   — list (filters, latest 200)
 * GET  /api/activity-logs/entity/:entityType/:entityId    — full history for one entity
 */
@ApiTags('Activity Logs')
@ApiBearerAuth()
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Log an action for the audit trail' })
  create(@Req() req: Request, @Body() dto: CreateActivityLogDto) {
    return this.activityLogsService.create(dto, req.ip, req.headers['user-agent'] ?? null);
  }

  @Get()
  @ApiOperation({ summary: 'List recent activity (latest 200, optional filters)' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'entityType', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  findAll(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.activityLogsService.findAll({ userId, entityType, entityId });
  }
}
