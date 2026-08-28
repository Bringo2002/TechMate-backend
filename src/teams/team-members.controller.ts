import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { TeamMembersService } from './team-members.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from './dto/team.dto';

/**
 * POST   /api/team-members       — create
 * GET    /api/team-members       — list (excludes soft-deleted, ordered by name)
 * GET    /api/team-members/:id   — get one
 * PUT    /api/team-members/:id   — update
 * DELETE /api/team-members/:id   — soft-delete
 */
@ApiTags('Team Members')
@ApiBearerAuth()
@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly teamMembersService: TeamMembersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a team member' })
  create(@Body() dto: CreateTeamMemberDto) {
    return this.teamMembersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List team members' })
  findAll() {
    return this.teamMembersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team member by id' })
  findOne(@Param('id') id: string) {
    return this.teamMembersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a team member' })
  update(@Param('id') id: string, @Body() dto: UpdateTeamMemberDto) {
    return this.teamMembersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a team member' })
  remove(@Param('id') id: string) {
    return this.teamMembersService.remove(id);
  }
}
