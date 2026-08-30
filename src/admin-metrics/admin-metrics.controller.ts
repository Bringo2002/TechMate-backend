import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { AdminMetricsService } from './admin-metrics.service';
import { CreateAdminMetricDto } from './dto/admin-metric.dto';

/**
 * GET  /api/admin-metrics/live                — live computed snapshot (get_admin_metrics())
 * GET  /api/admin-metrics/user-growth         — monthly user growth (get_user_growth())
 * GET  /api/admin-metrics/revenue-by-month    — monthly revenue (get_revenue_by_month())
 * GET  /api/admin-metrics                     — list daily snapshots
 * GET  /api/admin-metrics/latest              — most recent daily snapshot
 * POST /api/admin-metrics                     — create a daily snapshot
 */
@ApiTags('Admin Metrics')
@ApiBearerAuth()
@Controller('admin-metrics')
export class AdminMetricsController {
  constructor(private readonly adminMetricsService: AdminMetricsService) {}

  @Get('live')
  @ApiOperation({ summary: 'Live computed admin dashboard metrics' })
  getLiveMetrics() {
    return this.adminMetricsService.getLiveMetrics();
  }

  @Get('user-growth')
  @ApiOperation({ summary: 'Monthly user growth for charts' })
  @ApiQuery({ name: 'months', required: false })
  getUserGrowth(@Query('months') months?: string) {
    return this.adminMetricsService.getUserGrowth(months ? Number(months) : undefined);
  }

  @Get('revenue-by-month')
  @ApiOperation({ summary: 'Monthly revenue for charts' })
  @ApiQuery({ name: 'months', required: false })
  getRevenueByMonth(@Query('months') months?: string) {
    return this.adminMetricsService.getRevenueByMonth(months ? Number(months) : undefined);
  }

  @Get('latest')
  @ApiOperation({ summary: 'Most recent daily metrics snapshot' })
  findLatest() {
    return this.adminMetricsService.findLatest();
  }

  @Get()
  @ApiOperation({ summary: 'List all daily metrics snapshots' })
  findAll() {
    return this.adminMetricsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a daily metrics snapshot' })
  createSnapshot(@Body() dto: CreateAdminMetricDto) {
    return this.adminMetricsService.createSnapshot(dto);
  }
}
