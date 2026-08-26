import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';

/**
 * Dashboard controller — admin-only analytics
 *
 * GET /api/dashboard/overview   — totals (users, requests, revenue)
 * GET /api/dashboard/users      — user growth time series
 * GET /api/dashboard/revenue    — revenue time series
 * GET /api/dashboard/requests   — request breakdown by status
 * GET /api/dashboard/recent     — recent requests
 */
@ApiTags('Dashboard')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Dashboard overview stats (admin only)' })
  async overview(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOverview(query.from, query.to);
  }

  @Get('users')
  @ApiOperation({ summary: 'User growth time series (admin only)' })
  async usersSeries(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getUserGrowth(
      query.from, query.to, query.bucket, query.limit,
    );
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue time series (admin only)' })
  async revenueSeries(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRevenueSeries(
      query.from, query.to, query.bucket, query.limit,
    );
  }

  @Get('requests')
  @ApiOperation({ summary: 'Request breakdown by status (admin only)' })
  async requestsBreakdown(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRequestBreakdown(query.from, query.to);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Recent requests (admin only)' })
  async recentRequests(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRecentRequests(query.limit);
  }
}
