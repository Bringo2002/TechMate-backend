import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingDto } from './dto/booking.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Bookings controller
 *
 * POST   /api/bookings          — create a booking (authenticated user)
 * GET    /api/bookings          — list own bookings
 * GET    /api/bookings/all      — list all bookings (admin)
 * GET    /api/bookings/:id      — get a booking
 * PUT    /api/bookings/:id      — update a booking (admin)
 * DELETE /api/bookings/:id      — cancel a booking
 */
@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @Req() req: Request & { user: User },
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own bookings' })
  async findMine(@Req() req: Request & { user: User }) {
    return this.bookingsService.findByUser(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('all')
  @ApiOperation({ summary: 'List all bookings (admin)' })
  async findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a booking (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
    return this.bookingsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
