import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { DeploymentsService } from './deployments.service';
import {
  CreateDeploymentDto,
  UpdateDeploymentDto,
  UpdateDeploymentStageDto,
  AddDeploymentLogDto,
  RequestApprovalDto,
  ResolveApprovalDto,
  SearchDeploymentsDto,
  PromoteDeploymentDto,
} from './dto/deployment.dto';

@ApiTags('Deployments')
@ApiBearerAuth()
@Controller('deployments')
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  // ── Core CRUD ──────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a deployment (with default or custom pipeline stages)' })
  create(@Body() dto: CreateDeploymentDto) {
    return this.deploymentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List deployments (filters: status, environmentId, projectId, triggeredBy, limit, offset)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'environmentId', required: false })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'triggeredBy', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('environmentId') environmentId?: string,
    @Query('projectId') projectId?: string,
    @Query('triggeredBy') triggeredBy?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.deploymentsService.findAll({
      status,
      environmentId,
      projectId,
      triggeredBy,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  // ── Fixed sub-routes BEFORE :id routes to avoid route-ordering conflicts ──

  @Get('metrics')
  @ApiOperation({ summary: 'Aggregate deployment metrics' })
  @ApiQuery({ name: 'daysBack', required: false })
  getMetrics(@Query('daysBack') daysBack?: string) {
    return this.deploymentsService.getMetrics(daysBack ? Number(daysBack) : undefined);
  }

  @Get('today-summary')
  @ApiOperation({ summary: "Today's deployment summary" })
  getTodaySummary() {
    return this.deploymentsService.getTodaySummary();
  }

  @Get('projects')
  @ApiOperation({ summary: 'Distinct projects that have deployments (for filter dropdowns)' })
  getDeploymentProjects() {
    return this.deploymentsService.getDeploymentProjects();
  }

  @Post('search')
  @ApiOperation({ summary: 'Full-text search deployments with filters and pagination' })
  search(@Body() dto: SearchDeploymentsDto) {
    return this.deploymentsService.search(dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Deployment history for a project (paginated)' })
  @ApiQuery({ name: 'projectId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  getHistory(
    @Query('projectId') projectId?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.deploymentsService.getHistory(
      projectId,
      page ? Number(page) : undefined,
      perPage ? Number(perPage) : undefined,
    );
  }

  @Get('insights')
  @ApiOperation({ summary: 'Deployment insights (optionally scoped to one deployment)' })
  @ApiQuery({ name: 'deploymentId', required: false })
  getInsights(@Query('deploymentId') deploymentId?: string) {
    return this.deploymentsService.getInsights(deploymentId);
  }

  @Put('insights/:id/dismiss')
  @ApiOperation({ summary: 'Dismiss an insight' })
  dismissInsight(@Param('id') id: string) {
    return this.deploymentsService.dismissInsight(id);
  }

  @Put('stages/:id')
  @ApiOperation({ summary: 'Update a deployment stage' })
  updateStage(@Param('id') id: string, @Body() dto: UpdateDeploymentStageDto) {
    return this.deploymentsService.updateStage(id, dto);
  }

  // ── :id routes ─────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a deployment by id (with stages)' })
  findOne(@Param('id') id: string) {
    return this.deploymentsService.findOne(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: 'Get a deployment with stages, logs, and approvals' })
  getWithDetails(@Param('id') id: string) {
    return this.deploymentsService.getWithDetails(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a deployment' })
  update(@Param('id') id: string, @Body() dto: UpdateDeploymentDto) {
    return this.deploymentsService.update(id, dto);
  }

  @Put(':id/rollback')
  @ApiOperation({ summary: 'Roll back a deployment' })
  rollback(@Param('id') id: string) {
    return this.deploymentsService.rollback(id);
  }

  @Put(':id/promote')
  @ApiOperation({ summary: 'Promote a successful deployment to a target environment' })
  promote(@Param('id') id: string, @Body() dto: PromoteDeploymentDto) {
    return this.deploymentsService.promote(id, dto.targetEnvironmentId, dto.promoterId);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get logs for a deployment (optionally filtered by stage)' })
  @ApiQuery({ name: 'stageName', required: false })
  getLogs(@Param('id') id: string, @Query('stageName') stageName?: string) {
    return this.deploymentsService.getLogs(id, stageName);
  }

  @Post(':id/logs')
  @ApiOperation({ summary: 'Add a log entry to a deployment' })
  addLog(@Param('id') id: string, @Body() dto: AddDeploymentLogDto) {
    return this.deploymentsService.addLog(id, dto);
  }

  @Get(':id/approvals')
  @ApiOperation({ summary: 'Get approval requests for a deployment' })
  getApprovals(@Param('id') id: string) {
    return this.deploymentsService.getApprovals(id);
  }

  @Post(':id/approvals')
  @ApiOperation({ summary: 'Request approval for a deployment' })
  requestApproval(@Param('id') id: string, @Body() dto: RequestApprovalDto) {
    return this.deploymentsService.requestApproval(id, dto);
  }

  @Put('approvals/:approvalId/resolve')
  @ApiOperation({ summary: 'Approve or reject an approval request' })
  resolveApproval(@Param('approvalId') approvalId: string, @Body() dto: ResolveApprovalDto) {
    return this.deploymentsService.resolveApproval(approvalId, dto);
  }
}
