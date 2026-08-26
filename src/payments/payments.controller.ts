import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';

import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums';
import { User } from '../users/entities/user.entity';

/**
 * Payments controller
 *
 * POST   /api/payments          — create a payment (authenticated)
 * GET    /api/payments          — list own payments
 * GET    /api/payments/all      — list all payments (admin)
 * GET    /api/payments/:id      — get a payment
 * PUT    /api/payments/:id      — update payment status (admin)
 * DELETE /api/payments/:id      — soft-delete a payment (admin)
 */
@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a payment record' })
  async create(
    @Req() req: Request & { user: User },
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own payments' })
  async findMine(@Req() req: Request & { user: User }) {
    return this.paymentsService.findByUser(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('all')
  @ApiOperation({ summary: 'List all payments (admin)' })
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by ID' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update payment status (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a payment (admin)' })
  async remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
