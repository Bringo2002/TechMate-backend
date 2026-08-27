import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import { OrderStatus } from './entities/order.entity';

/**
 * POST   /api/orders                  — create
 * GET    /api/orders?userId=          — list (optional filter)
 * GET    /api/orders/stats?userId=    — aggregate stats
 * GET    /api/orders/:id              — get one
 * PUT    /api/orders/:id              — update
 * PUT    /api/orders/:id/status       — change status
 * GET    /api/orders/:id/deliverables — list deliverables for this order
 * DELETE /api/orders/:id              — soft-delete
 */
@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.ordersService.findAll(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate order stats' })
  @ApiQuery({ name: 'userId', required: false })
  getStats(@Query('userId') userId?: string) {
    return this.ordersService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an order' })
  update(@Param('id') id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change order status' })
  updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersService.updateStatus(id, status);
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'List deliverables for an order' })
  getDeliverables(@Param('id') id: string) {
    return this.ordersService.getDeliverables(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an order' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
