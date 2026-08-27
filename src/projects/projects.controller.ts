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

import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CreateProjectAssignmentDto,
  CreateProjectUpdateDto,
} from './dto/project.dto';

/**
 * POST   /api/projects                      — create a project
 * GET    /api/projects                      — list (optional ?userId=)
 * GET    /api/projects/stats                — aggregate stats (optional ?userId=)
 * GET    /api/projects/:id                  — get one
 * PUT    /api/projects/:id                  — update
 * DELETE /api/projects/:id                  — soft-delete
 * POST   /api/projects/:id/assignments      — assign a team member
 * GET    /api/projects/:id/assignments      — list assignments
 * POST   /api/projects/:id/updates          — post a progress update
 * GET    /api/projects/:id/updates          — list updates (optional ?clientVisibleOnly=true)
 * GET    /api/projects/:id/deliverables     — list deliverables
 */
@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.projectsService.findAll(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate project stats' })
  @ApiQuery({ name: 'userId', required: false })
  getStats(@Query('userId') userId?: string) {
    return this.projectsService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by id' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a project' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  @Post(':id/assignments')
  @ApiOperation({ summary: 'Assign a team member to a project' })
  addAssignment(@Param('id') id: string, @Body() dto: CreateProjectAssignmentDto) {
    return this.projectsService.addAssignment(id, dto);
  }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'List a project\'s assignments' })
  getAssignments(@Param('id') id: string) {
    return this.projectsService.getAssignments(id);
  }

  @Post(':id/updates')
  @ApiOperation({ summary: 'Post a progress update' })
  addUpdate(@Param('id') id: string, @Body() dto: CreateProjectUpdateDto) {
    return this.projectsService.addUpdate(id, dto);
  }

  @Get(':id/updates')
  @ApiOperation({ summary: 'List progress updates' })
  @ApiQuery({ name: 'clientVisibleOnly', required: false, type: Boolean })
  getUpdates(
    @Param('id') id: string,
    @Query('clientVisibleOnly') clientVisibleOnly?: string,
  ) {
    return this.projectsService.getUpdates(id, clientVisibleOnly === 'true');
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'List deliverables for a project' })
  getDeliverables(@Param('id') id: string) {
    return this.projectsService.getDeliverables(id);
  }
}
