import { randomUUID } from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Invoice, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkInvoicePaidDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    // Generate the id up front so we can derive invoice_number the same way
    // fix_invoices.sql backfilled existing rows: 'INV-' + first 8 chars of id.
    const id = randomUUID();
    const invoice = this.invoiceRepo.create({
      ...dto,
      id,
      invoiceNumber: dto.invoiceNumber ?? `INV-${id.slice(0, 8)}`,
    });
    const saved = await this.invoiceRepo.save(invoice);
    return this.findOne(saved.id); // re-read so the DB-computed total_amount comes back
  }

  async findAll(userId?: string): Promise<Invoice[]> {
    return this.invoiceRepo.find({
      where: { ...(userId ? { userId } : {}), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async update(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    Object.assign(invoice, dto);
    await this.invoiceRepo.save(invoice);
    return this.findOne(id);
  }

  async markPaid(id: string, dto: MarkInvoicePaidDto): Promise<Invoice> {
    const invoice = await this.findOne(id);
    invoice.status = InvoiceStatus.PAID;
    invoice.paidDate = new Date();
    invoice.paymentMethod = dto.paymentMethod;
    invoice.paymentReference = dto.paymentReference ?? invoice.paymentReference;
    await this.invoiceRepo.save(invoice);
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    const invoice = await this.findOne(id);
    invoice.deletedAt = new Date();
    await this.invoiceRepo.save(invoice);
    return { message: 'Invoice deleted successfully' };
  }

  /** Matches the frontend's InvoiceStats shape exactly. */
  async getStats(userId: string) {
    const invoices = await this.invoiceRepo.find({
      where: { userId, deletedAt: IsNull() },
      select: ['status', 'totalAmount', 'amount'],
    });

    const amountOf = (inv: Invoice) => Number(inv.totalAmount ?? inv.amount ?? 0);

    return {
      invoiceCount: invoices.length,
      totalInvoiced: invoices.reduce((sum, inv) => sum + amountOf(inv), 0),
      totalPaid: invoices
        .filter((inv) => inv.status === InvoiceStatus.PAID)
        .reduce((sum, inv) => sum + amountOf(inv), 0),
      totalOutstanding: invoices
        .filter((inv) => [InvoiceStatus.SENT, InvoiceStatus.OVERDUE].includes(inv.status))
        .reduce((sum, inv) => sum + amountOf(inv), 0),
      overdueCount: invoices.filter((inv) => inv.status === InvoiceStatus.OVERDUE).length,
    };
  }
}
