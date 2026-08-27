import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ProposalsService } from './proposals.service';
import { CreateProposalDto, UpdateProposalDto, RespondToProposalDto } from './dto/proposal.dto';

/**
 * POST   /api/proposals                     — create (draft)
 * GET    /api/proposals?inquiryId=          — list (optional filter)
 * GET    /api/proposals/:id                 — get one (with inquiry + creator)
 * PUT    /api/proposals/:id                 — update (draft edits)
 * POST   /api/proposals/:id/send            — mark sent
 * POST   /api/proposals/:id/view            — mark viewed by client
 * POST   /api/proposals/:id/respond         — client accepts/rejects
 * POST   /api/proposals/:id/withdraw        — withdraw
 * POST   /api/proposals/:id/revise          — create a new version
 * DELETE /api/proposals/:id                 — soft-delete
 */
@ApiTags('Proposals')
@ApiBearerAuth()
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a draft proposal' })
  create(@Body() dto: CreateProposalDto) {
    return this.proposalsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List proposals' })
  @ApiQuery({ name: 'inquiryId', required: false })
  findAll(@Query('inquiryId') inquiryId?: string) {
    return this.proposalsService.findAll(inquiryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a proposal by id' })
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a draft proposal' })
  update(@Param('id') id: string, @Body() dto: UpdateProposalDto) {
    return this.proposalsService.update(id, dto);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Mark proposal as sent to client' })
  send(@Param('id') id: string) {
    return this.proposalsService.send(id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Mark proposal as viewed by client' })
  markViewed(@Param('id') id: string) {
    return this.proposalsService.markViewed(id);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'Client accepts or rejects the proposal' })
  respond(@Param('id') id: string, @Body() dto: RespondToProposalDto) {
    return this.proposalsService.respond(id, dto);
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw a sent proposal' })
  withdraw(@Param('id') id: string) {
    return this.proposalsService.withdraw(id);
  }

  @Post(':id/revise')
  @ApiOperation({ summary: 'Create a new version of an existing proposal' })
  revise(@Param('id') id: string) {
    return this.proposalsService.createRevision(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a proposal' })
  remove(@Param('id') id: string) {
    return this.proposalsService.remove(id);
  }
}
