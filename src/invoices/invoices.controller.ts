import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkInvoicePaidDto } from './dto/invoice.dto';

/**
 * POST   /api/invoices                — create (admin-side; no frontend UI calls this yet)
 * GET    /api/invoices?userId=        — list for a user
 * GET    /api/invoices/stats?userId=  — InvoiceStats (matches frontend's getInvoiceStats)
 * GET    /api/invoices/:id            — get one
 * PUT    /api/invoices/:id            — update
 * POST   /api/invoices/:id/mark-paid  — mark paid
 * DELETE /api/invoices/:id            — soft-delete
 */
@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an invoice' })
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  @ApiQuery({ name: 'userId', required: false })
  findAll(@Query('userId') userId?: string) {
    return this.invoicesService.findAll(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Aggregate invoice stats for a user' })
  @ApiQuery({ name: 'userId', required: true })
  getStats(@Query('userId') userId: string) {
    return this.invoicesService.getStats(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by id' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an invoice' })
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoicesService.update(id, dto);
  }

  @Post(':id/mark-paid')
  @ApiOperation({ summary: 'Mark an invoice as paid' })
  markPaid(@Param('id') id: string, @Body() dto: MarkInvoicePaidDto) {
    return this.invoicesService.markPaid(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete an invoice' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
