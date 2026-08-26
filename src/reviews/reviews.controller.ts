import { Controller, Get, Post, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Reviews controller
 *
 * POST   /api/reviews                      — create a review (authenticated)
 * GET    /api/reviews/service/:serviceId   — list reviews for a service (public)
 * GET    /api/reviews/rating/:serviceId    — average rating for a service (public)
 * DELETE /api/reviews/:id                  — delete a review (admin)
 */
@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a service' })
  async create(
    @Req() req: Request & { user: User },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.create(req.user.id, dto);
  }

  @Public()
  @Get('service/:serviceId')
  @ApiOperation({ summary: 'List reviews for a service' })
  async findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByService(serviceId);
  }

  @Public()
  @Get('rating/:serviceId')
  @ApiOperation({ summary: 'Get average rating for a service' })
  async getAverageRating(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getAverageRating(serviceId);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review (admin)' })
  async remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
